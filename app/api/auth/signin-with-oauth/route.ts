import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handler/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";

// ? โค้ดนี้คือ API ENDPOINT  สำหรับจัดการการล็อกอินด้วย OAUTH (เช่น การล็อกอินผ่าน Google, Github) โดยเขียนเพื่อจัดการข้อมูลผู้ใช้และบัญชีที่เชื่อมต่อ
// ? ประโยชน์ก็คือ รองรับการล็อกอินผ่าน OAuth provider หลายๆแบบ, ป้องกันการสร้างบัญชีซ้ำซ้อน, จัดการข้อผิดพลาดอย่างมีระบบ

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json(); //* รับข้อมูลจาก request

  await dbConnect();

  // Find or create user

  const session = await mongoose.startSession();
  session.startTransaction();

  //* เริ่มใช่ MongoDB Transaction เพื่อให้แน่ใจว่าการทำงานทั้งหมดจะสำเร็จหรือล้มเหลวพร้อมกัน
  // ! ถ้ามีข้อผิดพลาดก็จะ Rollback ทั้งหมด
  // if we try to create an account => FAILS
  // we try to create a user => FAILS

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    }); //* ตรวจสอบความถูกต้องของข้อมูลที่ได้รับ ถ้าข้อมูลไม่ถูกต้องจะส่ง Error กลับ

    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const { name, username, email, image } = user;

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session); //* ค้นหาผู้ใช้ด้วยอีเมล
    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, username: slugifiedUsername, email, image }],
        { session }
      ); //* ถ้าไม่พบก็สร้างผู้ใช้ใหม่
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;

      //  * ถ้าพบว่ามีอยู่แล้วก็จะอัพเดตข้อมูลที่เปลี่ยนแปลง (เช่น ชื่อ, รูปภาพ)
      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData }
        ).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session); //* ตรวจสอบว่ามีการเชื่อมต่อกับ provider แล้วหรือไม่

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    } //* ถ้ายังไม่มีก็สร้างการเชื่อมต่อใหม่กับ provider

    await session.commitTransaction(); // * ถ้าทุกอย่างสำเร็จก็จะ commit transaction
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction(); //* หากว่ามีข้อผิดพลาดจะ abort transaction และส่ง error กลับ
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    session.endSession(); //* ปิด session ไม่ว่าจะสำเร็จหรือไม่
  }
}
