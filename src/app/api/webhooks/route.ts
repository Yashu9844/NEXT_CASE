import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from 'resend'
import OrderReceivedEmail from "@/app/components/emails/OrderReceivedEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const body = await req.text()
        const signature = headers().get("stripe-signature")
        if (!signature) {
            return new Response('Invalid signature', { status: 400 })
        }

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            // Check if customer details are available
            const customerDetails = session.customer_details
            if (!customerDetails?.email) {
                throw new Error("Missing customer details")
            }

            const { userId, orderId } = session.metadata || {
                userId: null,
                orderId: null
            }
            if (!userId || !orderId) {
                throw new Error("Invalid request metadata")
            }

            const billingAddress = customerDetails.address
            const shippingAddress = session.shipping_details?.address

            // Update order details with shipping and billing addresses
            const updatedOrder = await db.order.update({
                where: { id: orderId },
                data: {
                    isPaid: true,
                    shippingAddress: {
                        create: {
                            name: customerDetails.name || "Unknown",
                            city: shippingAddress?.city || "Unknown",
                            country: shippingAddress?.country || "Unknown",
                            postalCode: shippingAddress?.postal_code || "Unknown",
                            street: shippingAddress?.line1 || "Unknown",
                            state: shippingAddress?.state || "Unknown",
                        }
                    },
                    billingAddress: {
                        create: {
                            name: customerDetails.name || "Unknown",
                            city: billingAddress?.city || "Unknown",
                            country: billingAddress?.country || "Unknown",
                            postalCode: billingAddress?.postal_code || "Unknown",
                            street: billingAddress?.line1 || "Unknown",
                            state: billingAddress?.state || "Unknown",
                        }
                    }
                }
            })

            // Send confirmation email
            await resend.emails.send({
               from: 'YahsuCase <murthyrajashekar3@gmail.com>',
               to: [event.data.object.customer_details?.email || ''],
               subject: 'Thanks for your order!',
               react: OrderReceivedEmail({
                 orderId,
                 orderDate: updatedOrder.createdAt.toLocaleDateString(),
                // @ts-expect-error: Stripe types do not match our internal email template, but fields exist
                 shippingAddress: {
                   name: session.customer_details!.name!,
                   city: shippingAddress!.city!,
                   country: shippingAddress!.country!,
                   postalCode: shippingAddress!.postal_code!,
                   street: shippingAddress!.line1!,
                   state: shippingAddress!.state,
                 },
               }),
             })
           }

        return NextResponse.json({ result: event, ok: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                message: "Something went wrong",
                ok: false,
                status: 500
            }
        )
    }
}
