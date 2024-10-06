"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "./actions";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PhonePreview from "../components/PhonePreview";

const ThanKYou = () => {
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("orderId");

    // Declare orderId as a string
    let orderId: string;

    if (orderIdParam) {
        orderId = orderIdParam; // Assign value to orderId
    } else {
        console.error('orderId not found in search parameters');
        // You can redirect or throw an error here if necessary
        throw new Error('orderId is required');
    }

    const { data } = useQuery({
        queryKey: ["get-payment-status"],
        queryFn: async () => await getPaymentStatus({ orderId }), // orderId is now guaranteed to be a string
        retry: true,
        retryDelay: 500,
    });
  if(data === undefined){
    return <div className="w-dull mt-24 flex justify-center"  >
        <div className="flex flx-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            <h3 className="font-semibold text-xl" >Loading your order....</h3>
            <p>This won't take long.</p>
        </div>
    </div> // Show loading state while waiting for data
  }

if(data === false){
    return <div className="w-dull mt-24 flex justify-center"  >
    <div className="flex flx-col items-center gap-2">
        <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
        <h3 className="font-semibold text-xl" >Verifying you payment...</h3>
        <p>This might  take a moment.</p>
    </div>
</div>
}

const {configuration , billingAdress , shippingAddress , amount } = data
const {color , croppedImageUrl} = configuration



    return (
        <div className="bg-white"  >
            <div className="mx-auto mx-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-w-xl">
                    <p className="text-base font-medium text-primary">Thank you!</p>
                    <h1 className="mt-2 font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl" >Your case is  on the way!</h1>
                    <p className="mt-2 text-base text-zinc-500" >We've recevied your order and now processing it.</p>
                    <div className="mt-12 font-medium text-sm flex gap-3">
                        <p>Order number :</p>
                        <p>{orderId}</p>
                    </div>
                </div>


             <div className="mt-10 border-t border-zinc-200">
                <div className="mt-10 flex flex-auto flex-col">
                    <h4 className="font-semibold text-zinc-900 " >You made a great choice !</h4>
                    <p className='mt-2 text-sm text-zinc-600'>
              We at CaseCobra believe that a phone case doesn't only need to
              look good, but also last you for the years to come. We offer a
              5-year print guarantee: If you case isn't of the highest quality,
              we'll replace it for free.
            </p>
                </div>
             </div>

         <div className="flex space-x-6 overflow-hidden mt-4 rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl ">

         <PhonePreview  color={color!} croppedImageUrl={croppedImageUrl!}  />
         
         </div>


            </div>


            
        </div>
    );
};

export default ThanKYou;
