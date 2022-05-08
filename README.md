# Usermode

Minimal usermode-like library for NodeJS.

## Installation

```bash
npm install usermode
```

## Usage

```javascript
import { Usermode } from "usermode";

/**
 * Initialize Usermode
 * If the file does not exist, it will be created
 * @function init
 * @memberof Usermode
 * @static
 * @param {string} filepath
 * @returns {void}
 */
Usermode.init("./path/to/file.json");

/**
 * Add user
 * @function addUser
 * @memberof Usermode
 * @static
 * @param {User} user
 * @returns {User} or
 * @throws {Username "username" already exists!}
 */
const user = Usermode.addUser({
    username: "user_1",
    password: "pass_1",
    fullname: "User One", // optional
});

/**
 * Get user
 * @function getUser
 * @memberof Usermode
 * @static
 * @param {string} username
 * @returns {User | void}
 */
const user = Usermode.getUser("username");

/**
 * Set user
 * Changes the password and / or full name
 * By default the password match is mandatory,
 * unless the __force parameter is set to true
 * @function setUser
 * @memberof Usermode
 * @static
 * @param {User} user
 * @param {password?, fullname?, __force?}
 * @returns {User | void}
 */
const user = Usermode.setUser(
    {
        username: "user_1",
        password: "pass_1",
    },
    {
        pass: "pass_2",
        fullename: "User One updated",
        __force: true, // false by default
    }
);

/**
 * Create user's home directory in the same 
 * directory as `filepath` (see the `init` method)
 * @function setHome
 * @memberof Usermode
 * @static
 * @param {string} username
 * @returns {string}
 */
Usermode.setHome(username);

/**
 * Get user's home directory
 * @function getHome
 * @memberof Usermode
 * @static
 * @param {string} username
 * @returns {string | void}
 */
Usermode.getHome(username);

/**
 * Check user's password
 * @function getHome
 * @memberof Usermode
 * @static
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
Usermode.passMatch(username, password);

See more examples in the [unit tests](https://github.com/vidul-nikolaev-petrov/usermode/blob/main/tests/index.test.ts).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.


## License

[MIT](https://github.com/vidul-nikolaev-petrov/usermode/blob/main/LICENSE)