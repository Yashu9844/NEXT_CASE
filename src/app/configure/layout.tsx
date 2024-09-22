import { ReactNode } from "react";
import MaxWidthWrapper from "../components/MaxWidthWrapper";

const Layout = ({children}:{children:ReactNode}) => {
  return (
    <MaxWidthWrapper className="flex flex-col flex-1">
      {children}
    </MaxWidthWrapper>
  );
};

export default Layout;