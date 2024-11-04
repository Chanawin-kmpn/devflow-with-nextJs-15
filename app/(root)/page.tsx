import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Home = async () => {
  const session = await auth();

  return (
    <>
      <h1 className="h1-bold">Welcome to the world of Next.js</h1>
    </>
  );
};

export default Home;
