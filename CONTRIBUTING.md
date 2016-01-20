Models and Collections
----------------------
Each model and collection class has a static method, `fetch` which accepts query paramaters as an
argument and returns a promise which, if successful, will resolve with an instance of that class.

Models and collections inherit from base classes:
 - `src/collections/base.js`
 - `src/models/base.js`

The base classes implements static methods for making HTTP requests.
 - `collectionResourceRequest` (for collections)
 - `instanceResourceRequest` (for instances)

These methods handle HTTP error detection and return the response body.

These methods wrap the http-client request and they are invoked by subclass methods that make HTTP
requests to API. For example, an instance of `InstanceModel` has a `start()` method, which will
invoke `instanceResourceRequest` on its parent class.
