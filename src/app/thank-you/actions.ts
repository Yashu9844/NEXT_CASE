"use server"

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const getPaymentStatus = async ({orderId}:{orderId:string})=>{

 const {getUser} = getKindeServerSession();

 const user = await getUser();

 if(!user?.id ||!user.email){
    throw new Error("Invalid user data")
 }

 const order = await db.order.findFirst({
    where:{
        id:orderId,
        userId:user.id,
    },
    include:{
        shippingAddress:true,
        billingAddress:true,
        configuration:true,
        user:true
    }
 })

 if(!order){
    throw new Error("These order not found")
 }


 if(order.isPaid){
    return order
 }else{
    return false
 }


}