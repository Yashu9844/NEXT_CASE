"use server"

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products"
import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Order } from "@prisma/client"

export const createCheckoutSession = async ({ configId }: { configId: string }) => {
  // Retrieve the configuration based on the provided configId
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  // Check if the configuration exists
  if (!configuration) {
    throw new Error("Configuration not found");
  }

  // Get the current user session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Ensure the user is logged in
  if (!user) {
    throw new Error("User not logged in");
  }

  // Calculate the price based on the configuration
  const { finish, material } = configuration;
  let price = BASE_PRICE;

  // Adjust price based on material and finish
  if (finish === "textured") {
    price += PRODUCT_PRICES.finish.texture;
  }
  if (material === "polycarbonate") {
    price += PRODUCT_PRICES.material.polycarbonate;
  }

  // Check for an existing order for this user and configuration
  let order: Order | undefined;
  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id,
    },
  });

  // If an existing order is found, use it; otherwise, create a new one
  if (existingOrder) {
    order = existingOrder;
  } else {
    // Create a new order
    order = await db.order.create({
      data: {
        userId: user.id,
        configurationId: configuration.id,
        amount: price,
        // Add any other required fields for the Order model here
      },
    }).catch((error) => {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order. Please try again.");
    });
  }

  // Create a product in Stripe
  const product = await stripe.products.create({
    name: "Custom iPhone Case",
    images: [configuration.imageUrl],
    default_price_data: {
      currency: "INR",
      unit_amount: price * 100, // Convert price to the smallest currency unit
    },
  });

  // Create a Stripe checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ["card", "paypal", "amazon_pay"],
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["US", "IN", "DE"] },
    metadata: {
      userId: user.id,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });

  return { url: stripeSession.url };
}
