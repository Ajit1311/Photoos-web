
export type WatermarkSource =
  | "existing_logo"
  | "upload"
  | "uploaded_image";


export type WatermarkPosition =
  | "top_left"
  | "top_center"
  | "top_right"
  | "middle_left"
  | "center"
  | "middle_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right";


export type WatermarkFit =
  | "contain"
  | "cover"
  | "fill"
  | "none";


export type WatermarkSettings = {

  enabled:
    boolean;


  source:
    WatermarkSource;


  upload_url:
    string
    | null;


  uploaded_url:
    string
    | null;


  upload_name:
    string
    | null;


  size:
    number;


  opacity:
    number;


  padding:
    number;


  position:
    WatermarkPosition;


  rotation:
    number;


  fit:
    WatermarkFit;


  apply_on_export:
    boolean;


  apply_on_download:
    boolean;


  apply_on_client_preview:
    boolean;


  apply_on_shared_gallery:
    boolean;

};


export const DEFAULT_WATERMARK_SETTINGS:
  WatermarkSettings =
{
  enabled:
    false,

  source:
    "existing_logo",

  upload_url:
    null,

  uploaded_url:
    null,

  upload_name:
    null,

  size:
    20,

  opacity:
    70,

  padding:
    24,

  position:
    "bottom_right",

  rotation:
    0,

  fit:
    "contain",

  apply_on_export:
    true,

  apply_on_download:
    false,

  apply_on_client_preview:
    true,

  apply_on_shared_gallery:
    true,
};

