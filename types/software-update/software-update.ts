export type SoftwareUpdate = {

  id:
    string;

  version:
    string;

  release_name:
    string;

  schema_version:
    number;

  released_at:
    string;

  release_notes:
    string
    | null;

  metadata:
    Record<
      string,
      unknown
    >;

  created_at:
    string;

};
