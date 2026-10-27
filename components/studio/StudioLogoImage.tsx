"use client";

import {
  useState,
} from "react";


type StudioLogoImageProps = {
  src:
    string | null | undefined;

  alt:
    string;

  fallback:
    string;

  className:
    string;

  fallbackClassName:
    string;
};


export function StudioLogoImage(
  {
    src,
    alt,
    fallback,
    className,
    fallbackClassName,
  }:
    StudioLogoImageProps,
) {

  const [
    failed,
    setFailed,
  ] =
    useState(
      false,
    );


  const normalizedSrc =
    src?.trim() ||
    null;


  if (
    !normalizedSrc ||
    failed
  ) {
    return (

      <div
        className={
          fallbackClassName
        }
        aria-label={
          alt
        }
      >

        {fallback}

      </div>

    );
  }


  return (

    <img
      key={normalizedSrc}
      src={normalizedSrc}
      alt={alt}
      className={className}
      onError={() => {

        console.error(
          "STUDIO LOGO IMAGE LOAD FAILED:",
          normalizedSrc,
        );

        setFailed(
          true,
        );

      }}
      onLoad={() => {

        setFailed(
          false,
        );

      }}
    />

  );

}
