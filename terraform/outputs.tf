output "service_url" {
  value = google_cloud_run_v2_service.default.uri
}

output "repository_url" {
  value = google_artifact_registry_repository.repo.name
}
