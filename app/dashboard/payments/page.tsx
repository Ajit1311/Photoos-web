import {
  PaymentsWorkspace,
} from "@/components/payments/PaymentsWorkspace";

import {
  SubscriptionRenewalAction,
} from "@/components/subscription/SubscriptionRenewalAction";


type PaymentsPageProps = {
  searchParams:
    Promise<{
      subscription_action?:
        string;
    }>;
};


export default async function PaymentsPage(
  {
    searchParams,
  }: PaymentsPageProps,
) {

  const params =
    await searchParams;


  if (
    params.subscription_action === "renew" ||
    params.subscription_action === "upgrade"
  ) {

    return (
      <SubscriptionRenewalAction />
    );

  }


  return (
    <PaymentsWorkspace />
  );

}