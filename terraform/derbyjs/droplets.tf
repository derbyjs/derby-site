resource "digitalocean_droplet" "derbyjs" {
  count  = 1
  name   = "${format("derbyjs-%02d", count.index + 1)}"
  image  = "ubuntu-16-04-x64"
  region = "${var.digitalocean_region}"
  size   = "4gb"
}
