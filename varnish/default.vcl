# This is a basic VCL configuration file for varnish.  See the vcl(7)
# man page for details on VCL syntax and semantics.

import std;

# static
backend default {
  .host = "127.0.0.1";
  .port = "4000";
}
backend components {
  .host = "127.0.0.1";
  .port = "3330";
}
backend charts {
  .host = "127.0.0.1";
  .port = "8001";
}
backend chat {
  .host = "127.0.0.1";
  .port = "8002";
}
backend codemirror {
  .host = "127.0.0.1";
  .port = "8003";
}
backend directory {
  .host = "127.0.0.1";
  .port = "8004";
}
backend hello {
  .host = "127.0.0.1";
  .port = "8005";
}
backend sink {
  .host = "127.0.0.1";
  .port = "8006";
}
backend todos {
  .host = "127.0.0.1";
  .port = "8007";
}
backend widgets {
  .host = "127.0.0.1";
  .port = "8008";
}


sub vcl_recv {
  if (!req.http.Host) {
    error 404 "Need a host header";
  }

  set req.http.Host = regsub(req.http.Host, "^www\.", "");
  set req.http.Host = regsub(req.http.Host, ":80$", "");

  if (req.restarts == 0) {
    if (req.http.x-forwarded-for) {
      set req.http.X-Forwarded-For =
        req.http.X-Forwarded-For + ", " + client.ip;
    } else {
      set req.http.X-Forwarded-For = client.ip;
    }
  }

  if (req.http.Host ~ "^components\.") {
    set req.backend = components;
  } else if (req.http.Host ~ "^charts\.") {
    set req.backend = charts;
  } else if (req.http.Host ~ "^chat\.") {
    set req.backend = chat;
  } else if (req.http.Host ~ "^codemirror\.") {
    set req.backend = codemirror;
  } else if (req.http.Host ~ "^directory\.") {
    set req.backend = directory;
  } else if (req.http.Host ~ "^hello\.") {
    set req.backend = hello;
  } else if (req.http.Host ~ "^sink\.") {
    set req.backend = sink;
  } else if (req.http.Host ~ "^todos\.") {
    set req.backend = todos;
  } else if (req.http.Host ~ "^widgets\.") {
    set req.backend = widgets;
  }

  if (req.http.Upgrade ~ "(?i)websocket") {
    return (pipe);
  }
  if (req.request != "GET" &&
      req.request != "HEAD" &&
      req.request != "PUT" &&
      req.request != "POST" &&
      req.request != "TRACE" &&
      req.request != "OPTIONS" &&
      req.request != "DELETE") {
    /* Non-RFC2616 or CONNECT which is weird. */
    return (pipe);
  }
  if (req.request != "GET" && req.request != "HEAD") {
    /* We only deal with GET and HEAD by default */
    return (pass);
  }
  if (req.http.Authorization || req.http.Cookie) {
    /* Not cacheable by default */
    return (pass);
  }
  return (lookup);
}

sub vcl_pipe {
  # Websockets
  if (req.http.upgrade) {
    set bereq.http.upgrade = req.http.upgrade;
  }
  set bereq.http.connection = "close";

  return (pipe);
}

sub vcl_fetch {
  # Compress responses
  if (beresp.http.content-type ~ "text"
      || beresp.http.content-type ~ "json"
      || beresp.http.content-type ~ "javascript") {
    set beresp.do_gzip = true;
  }
}

sub vcl_error {
  if (obj.status == 750) {
    # moved permanently
    set obj.http.Location = req.http.Location;
    set obj.status = 301;
  } else if (obj.status == 752) {
    # moved temporarily
    set obj.http.Location = req.http.Location;
    set obj.status = 302;
  } else {
    set obj.http.Content-Type = "text/html; charset=utf-8";
    set obj.http.Retry-After = "5";
    synthetic std.fileread("/etc/varnish/503.html");
  }
  return (deliver);
}
