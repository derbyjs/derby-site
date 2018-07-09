resource "digitalocean_loadbalancer" "derbyjs" {
  name   = "derbyjs-lb"
  region = "${var.digitalocean_region}"

  forwarding_rule {
    entry_port     = 80
    entry_protocol = "http"

    target_port     = 8080
    target_protocol = "http"
  }

  healthcheck {
    port     = 8080
    protocol = "http"
    path     = "/_health"
  }

  droplet_ids = ["${digitalocean_droplet.derbyjs.*.id}"]
}
