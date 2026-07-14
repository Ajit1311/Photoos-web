import {
  getBootstrap,
} from "@/lib/api/bootstrap";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

class BootstrapRepository {

  async load(): Promise<BootstrapResponse> {
    return getBootstrap();
  }

}

export const bootstrapRepository =
  new BootstrapRepository();