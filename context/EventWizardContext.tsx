"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { useBootstrapContext } from "@/context/BootstrapContext";

import { eventRepository } from "@/lib/repositories/event.repository";

import {
  defaultEventWizardData,
  type EventWizardData,
} from "@/types/event-wizard";

type EventWizardContextValue = {
  currentStep: number;

  data: EventWizardData;

  submitting: boolean;

  error: string | null;

  setStep: (
    step: number,
  ) => void;

  nextStep: () => void;

  previousStep: () => void;

  setField: <
    K extends keyof EventWizardData,
  >(
    key: K,
    value: EventWizardData[K],
  ) => void;

  clearError: () => void;

  reset: () => void;

  submit: () => Promise<void>;
};

const EventWizardContext =
  createContext<EventWizardContextValue | null>(
    null,
  );

type Props = {
  children: ReactNode;
};

export function EventWizardProvider({
  children,
}: Props) {

  const router =
    useRouter();

  const {
    data: bootstrap,
  } = useBootstrapContext();

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  const [
    data,
    setData,
  ] = useState(
    defaultEventWizardData,
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const setStep =
    useCallback(
      (
        step: number,
      ) => {

        setCurrentStep(step);

      },
      [],
    );

  const nextStep =
    useCallback(() => {

      setCurrentStep(
        (step) =>
          Math.min(
            step + 1,
            7,
          ),
      );

    }, []);

  const previousStep =
    useCallback(() => {

      setCurrentStep(
        (step) =>
          Math.max(
            step - 1,
            1,
          ),
      );

    }, []);

  const setField =
    useCallback(
      <
        K extends keyof EventWizardData,
      >(
        key: K,
        value: EventWizardData[K],
      ) => {

        setData(
          (current) => ({
            ...current,
            [key]: value,
          }),
        );

      },
      [],
    );

  const clearError =
    useCallback(() => {

      setError(null);

    }, []);

  const reset =
    useCallback(() => {

      setCurrentStep(1);

      setData(
        defaultEventWizardData,
      );

      setError(null);

    }, []);

  const submit =
    useCallback(async () => {

      if (submitting) {
        return Promise.resolve();
      }

      if (!bootstrap) {
        throw new Error(
          "Bootstrap data not loaded.",
        );
      }

      const studioId =
        bootstrap.workspace.membership.studioId;

      if (!studioId) {
        throw new Error(
          "Studio not found.",
        );
      }

      setSubmitting(true);

      setError(null);

      try {

        await eventRepository.create(
          studioId,
          data,
        );

        reset();

        router.replace(
          "/dashboard/events",
        );

      } catch (err) {

        console.error(
          "Failed to create event",
          err,
        );

        if (
          err instanceof Error
        ) {

          setError(
            err.message,
          );

        } else {

          setError(
            "Unable to create event.",
          );

        }

      } finally {

        setSubmitting(false);

      }

    }, [
      bootstrap,
      data,
      submitting,
      reset,
      router,
    ]);

  const value =
    useMemo(
      () => ({
        currentStep,
        data,
        submitting,
        error,
        setStep,
        nextStep,
        previousStep,
        setField,
        clearError,
        reset,
        submit,
      }),
      [
        currentStep,
        data,
        submitting,
        error,
        setStep,
        nextStep,
        previousStep,
        setField,
        clearError,
        reset,
        submit,
      ],
    );

  return (
    <EventWizardContext.Provider
      value={value}
    >
      {children}
    </EventWizardContext.Provider>
  );

}

export function useEventWizard() {

  const context =
    useContext(
      EventWizardContext,
    );

  if (!context) {

    throw new Error(
      "useEventWizard must be used inside EventWizardProvider.",
    );

  }

  return context;

}