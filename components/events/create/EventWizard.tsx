import EventStepper from "./EventStepper";
import StepOneBasicDetails from "./StepOneBasicDetails";
import StepTwoClient from "./StepTwoClient";
import StepThreeTeam from "./StepThreeTeam";
import StepFourPricing from "./StepFourPricing";
import StepFiveGallery from "./StepFiveGallery";
import StepSixAI from "./StepSixAI";
import StepSevenReview from "./StepSevenReview";
import WizardFooter from "./WizardFooter";

import {
  EventWizardProvider,
} from "@/context/EventWizardContext";

function EventWizardContent() {

  return (

    <div className="space-y-8">

      <EventStepper />

      <StepOneBasicDetails />

      <StepTwoClient />

      <StepThreeTeam />

      <StepFourPricing />

      <StepFiveGallery />

      <StepSixAI />

      <StepSevenReview />

      <WizardFooter />

    </div>

  );

}

export default function EventWizard() {

  return (

    <EventWizardProvider>

      <EventWizardContent />

    </EventWizardProvider>

  );

}