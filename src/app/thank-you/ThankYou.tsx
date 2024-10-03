"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "./actions";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

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
        <h3 className="font-semibold text-xl" >Verifying you payment....</h3>
        <p>This might  take a moment.</p>
    </div>
</div>
}

const {configuration , billingAdress , } = data


    return (
        <div>
            ThanKYou
        </div>
    );
};

export default ThanKYou;
