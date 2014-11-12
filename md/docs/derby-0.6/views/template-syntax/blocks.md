# Blocks

Blocks are template expressions that start with special keywords. They are used to conditionally render, repeat, or control the way in which sections of a template are rendered.

Similar to HTML tags, blocks end in a forward slash followed by the same keyword that started them. The closing keyword is optional but recommended for clarity. Both `{{with}}...{{/with}}` and `{{with}}...{{/}}` are parsed correctly.

# Conditionals

Conditional blocks use the `if`, `else if`, `else`, and `unless` keywords. They render the first template section that matches a condition or nothing if none match. Like in Mustache and Handlebars, zero length arrays (`[]`) are treated as falsey. Other than that, falsey values are the same as JavaScript: `false`, `undefined`, `null`, `''`, and `0`.

```derby
{{if user.name}}
  <h1>user.name</h1>
{{else if user}}
  <h1>Unnamed user</h1>
{{else}}
  No user
{{/if}}
```

The inverse of `if` is `unless`. For clarity, unless should only be used when there is no `else` condition. A block that has an unless and else condition can be more clearly written as an if and else.

```derby
{{unless items}}
  Please add some items
{{/unless}}
```

# Each

# With

# On

# Unbound
