provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Create Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.service_name
  description   = "Docker repository for Spark Encyclopedia"
  format        = "DOCKER"
}

# 2. Deploy Cloud Run Service
# Note: Initially we deploy with a placeholder or 'hello-world' image 
# so Terraform can manage the service, or we let GH Actions handle the revision.
resource "google_cloud_run_v2_service" "default" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      # This image will be updated by GH Actions
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
      ports {
        container_port = 80
      }
    }
  }
}

# 3. Allow Public Access
resource "google_cloud_run_v2_service_iam_member" "noauth" {
  location = google_cloud_run_v2_service.default.location
  name     = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
