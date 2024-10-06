import { clsx, type ClassValue } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price :number) => {
  const formatter = new Intl.NumberFormat('en-US',{
    style:'currency',
    currency:"INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(price)
}

export function constructMetaData ({
  title = "CassyCase - custom high-quality phone cases",
  description = "A customizable and affordable phone case made from high-quality materials",
  icons = '/favicon.ico',
  image = '/thumbnail.png',
}:{
  title?: string,
  description?: string,
  icons?: string,
  image?: string,
} = {}): Metadata{
  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: "https://cassycase.com",
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images:[
        image
      ],

    },
    icons
   
  }
}