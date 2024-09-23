import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";

interface PageProps{
    searchParams:{
        [key:string] : string | string[] |  undefined  
    }
}

const Page = async ({searchParams} : PageProps) => {
const {id} = searchParams

if(!id || typeof id !== 'string'){
 return notFound()
}


const configuration = await db.configuration.findUnique({
    where: {id},
})

if(!configuration){
    return notFound()  // If no configuration found, return a 404 page
 
}

const {imageUrl , width , height} = configuration


  return <DesignConfigurator configId={configuration.id} imageDimensions={{width,height}}  imageUrl={imageUrl}  />
};

export default Page;