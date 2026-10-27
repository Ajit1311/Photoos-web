
import {
  getWorkspaceSettings,
} from "@/lib/api/workspace-settings/get-workspace-settings";

import {
  saveWorkspaceSetting,
} from "@/lib/api/workspace-settings/save-workspace-setting";

import type {
  WatermarkSettings,
} from "@/types/watermark-settings/watermark-settings";

import {
  DEFAULT_WATERMARK_SETTINGS,
} from "@/types/watermark-settings/watermark-settings";


const WATERMARK_SETTING_KEY =
  "watermark_settings";


const WATERMARK_CATEGORY =
  "studio";


export async function getWatermarkSettings(
  studioId:
    string,
):
  Promise<
    WatermarkSettings
  > {

  const settings =
    await getWorkspaceSettings(
      studioId,
    );


  const savedSetting =
    settings.find(
      (
        setting,
      ) =>
        setting.key ===
        WATERMARK_SETTING_KEY,
    );


  if (
    !savedSetting
  ) {

    return {
      ...DEFAULT_WATERMARK_SETTINGS,
    };

  }


  return {
    ...DEFAULT_WATERMARK_SETTINGS,

    ...savedSetting.value,
  } as WatermarkSettings;

}


export async function saveWatermarkSettings(
  studioId:
    string,

  settings:
    WatermarkSettings,
) {

  return saveWorkspaceSetting(
    studioId,

    WATERMARK_CATEGORY,

    WATERMARK_SETTING_KEY,

    settings as unknown as Record<
      string,
      unknown
    >,

    "Controls watermark source, appearance, position and delivery behavior for studio assets.",
  );

}

