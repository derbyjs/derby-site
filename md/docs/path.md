# Path

String to represent a JSON

## Paths

All model operations happen on paths which represent nested JSON objects. These paths must be globally unique within a particular database and Redis journal.

For example, the model:

    {
      title: 'Fruit store',
      fruits: [
        { name: 'banana', color: 'yellow' },
        { name: 'apple', color: 'red' },
        { name: 'lime', color: 'green' }
      ]
    }

Would have paths like `title`, `fruits.1`, and `fruits.0.color`. Any path segment that is a number must be an index of an array.

**WARNING:** If you want to use an id value that is a number as a path segment, be careful to prefix this with another character, such as `_` before setting it. Otherwise, you will accidentally create a gigantic array and probably run out of memory. For example, use a path like: `items._1239182389123.name` and never `items.1239182389123.name`.

### Local and remote collections

Collection names (i.e. the first path segment) that start with an underscore (`_`) or dollar sign (`$`) are local to a given model and are not synced. All paths that start with another character are remote, and will be synced to servers and other clients via ShareJS. Collections that begin with dollar signs are reserved for use by Racer, Derby, or extensions, and should not be used for application data.

Almost all non-synced data within an application should be stored underneath the `_page` local collection. This enables Derby to automatically cleanup as the user navigates between pages. Right before rendering a new page, Derby calls `model.destroy('_page')`, which removes all data, references, event listeners, and reactive functions underneath the `_page` collection. If you have some data that you would like to be maintained between page renders, it can be stored underneath a different local collection. This is useful for setting data on the server, such as setting `_session.userId` in authentication code. However, be very careful when storing local data outside of `_page`, since bleeding state between pages is likely to be a source of unexpected bugs.