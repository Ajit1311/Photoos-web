export type SubscriptionPaymentGatewayRequest = {
  paymentId: string;

  amount: number;

  currency: string;

  planName: string;

  paymentCategory:
    | "upi"
    | "net_banking"
    | "card";
};


export type SubscriptionPaymentGatewayResult = {
  success: boolean;

  transactionId: string | null;

  error: string | null;
};


export async function
processSubscriptionPayment(
  request:
    SubscriptionPaymentGatewayRequest,
):
  Promise<
    SubscriptionPaymentGatewayResult
  > {

  /*
   * Temporary mock gateway.
   *
   * The subscription flow does not depend on any
   * specific payment provider here.
   *
   * Later this function can delegate to:
   *
   * Razorpay
   * Stripe
   * Cashfree
   * PhonePe
   * PayU
   *
   * without changing the subscription renewal UI.
   */

  await new Promise(
    (
      resolve,
    ) => {

      window.setTimeout(
        resolve,
        1200,
      );

    },
  );


  return {
    success: true,

    transactionId:
      [
        "mock",
        request.paymentCategory,
        request.paymentId,
        Date.now(),
      ]
        .join(
          "-",
        ),

    error: null,
  };

}
