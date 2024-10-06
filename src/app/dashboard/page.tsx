import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound } from "next/navigation";

const Page =async () => {

   const {getUser} = getKindeServerSession()

   const user = await getUser()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL 

if(!user || user.email !== ADMIN_EMAIL){
   return notFound()
}

const orders = await db.order.findMany({
    where:{
        isPaid:true,
        createdAt:{
            gte:new Date(new Date().setDate(new Date().getDate()-7))
        }
    },
    orderBy:{
        createdAt:'desc'
    },
    include:{
        user:true,
        shippingAddress:true
    },
})


const lastWeekSum  = await db.order.aggregate({
    where:{
        isPaid:true,
        createdAt:{
            gte:new Date(new Date().setDate(new Date().getDate()-7))
        }
    },
    _sum:{
        amount:true
    }
})
const lastMonthSum  = await db.order.aggregate({
    where:{
        isPaid:true,
        createdAt:{
            gte:new Date(new Date().setDate(new Date().getDate()-30))
        }
    },
    _sum:{
        amount:true
    }
})
const formatLastMonth = Number(lastMonthSum._sum.amount) || 0
const  totalMonthSum = formatLastMonth*100
const MONTH_GOAL = 25000
const progressBarMonth = (totalMonthSum / MONTH_GOAL) * 100

const format = Number(lastWeekSum._sum.amount) || 0
const totalAmount = format * 100;

const WEEKLY_GOAL = 5000
const progressBar = (totalAmount / WEEKLY_GOAL) * 100

    return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
        <div className="flex flex-col gap-16">
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2" >
                       <CardDescription>Last Week</CardDescription>
                       <CardTitle className="text-4xl" >
                        {formatPrice(totalAmount)}
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground ">
                        of {formatPrice(WEEKLY_GOAL)} goal
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Progress value={progressBar}/>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="pb-2" >
                       <CardDescription>Last Month</CardDescription>
                       <CardTitle className="text-4xl" >
                        {formatPrice(totalMonthSum)}
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground ">
                        of {formatPrice(MONTH_GOAL)} goal
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Progress value={progressBarMonth}/>
                    </CardFooter>
                </Card>
            </div>
            <h1 className="text-4xl font-bold tracking-tight-">
                Incoming orders
            </h1>
        </div>
      </div>
    </div>
  );
};

export default Page;