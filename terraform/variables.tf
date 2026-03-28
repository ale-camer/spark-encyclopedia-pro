variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
  default     = "spark-tutorial-491521"
}

variable "region" {
  description = "The GCP region to deploy to"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
  default     = "spark-encyclopedia-pro"
}
