import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  imgUrl: string;
  alt: string;
  value: number | string;
  title: string;
  href?: string;
  textStyles: string;
  imgStyles?: string;
  isAuthor?: boolean;
  titleStyle?: string;
}
const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  imgStyles,
  titleStyle,
}: Props) => {
  const metricContent = (
    <>
      <Image
        src={imgUrl}
        alt={alt}
        width={16}
        height={16}
        className={`rounded-full object-contain ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}
        {title ? (
          <span className={cn(`small-regular line-clamp-1`, titleStyle)}>
            {title}
          </span>
        ) : null}
      </p>
    </>
  );
  return href ? (
    <Link className="flex-center items-center gap-1" href={href}>
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center items-center gap-1">{metricContent}</div>
  );
};

export default Metric;
