
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "npm:razorpay@2.8.6"

const razorpay = new Razorpay({
    key_id: Deno.env.get("RAZORPAY_KEY_ID") || "",
    key_secret: Deno.env.get("RAZORPAY_KEY_SECRET") || "",
});

serve(async (req) => {
    try {
        const { amount, currency = "INR", receipt } = await req.json()

        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects paise
            currency,
            receipt,
        })

        return new Response(JSON.stringify(order), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
