exports.generate = generate;

function getOutlineTitle(segments) {
  var last = segments[segments.length - 1];
  var title = last[0].toUpperCase() + last.slice(1);
  return title.replace(/-/g, ' ');
}
function generate(app) {
  var outline = {
    docs: {}
  };
  var links = {};
  var previousName;
  var nameMap = app.views.nameMap;
  for (var name in nameMap) {
    var segments = name.split(':');
    var section = outline[segments[0]];
    var listName = segments[1];
    if (!section || !listName) continue;
    var list = section[listName] || (section[listName] = []);

    // This is a hack, but rely on the fact that all of the markdown views are
    // unminified to figure out which should be in the outline
    if (!nameMap[name].unminified) continue;

    var href = '/' + name.replace(/:/g, '/');
    if (previousName) links[previousName] = href;

    list.push({
      title: getOutlineTitle(segments),
      level: segments.length - 2,
      name: name,
      href: href
    });
    previousName = name;
  }

  return {outline: outline, links: links};
}
