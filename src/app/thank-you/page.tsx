import { Suspense } from "react";
import ThanKYou from "./ThankYou";

const Page = () => {
  return (
    <Suspense>
      <ThanKYou/>
    </Suspense>
  );
};

export default Page;