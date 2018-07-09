resource "digitalocean_firewall" "derbyjs" {
  name = "derbyjs-rules"

  droplet_ids = ["${digitalocean_droplet.derbyjs.*.id}"]

  inbound_rule = [
    {
      protocol         = "tcp"
      port_range       = "22"
      source_addresses = ["184.23.195.146/32"]
    },
    {
      protocol                  = "tcp"
      port_range                = "8080"
      source_load_balancer_uids = ["${digitalocean_loadbalancer.derbyjs.id}"]
    },
  ]

  outbound_rule = [
    {
      protocol              = "tcp"
      port_range            = "1-65535"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "udp"
      port_range            = "1-65535"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]
}
