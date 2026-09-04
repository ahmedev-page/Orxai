export function getMetaGraphVersion(): string {
  return process.env.META_GRAPH_VERSION || "v20.0";
}