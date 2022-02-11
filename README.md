# Usermode

Usermode is a JavaScript library for dealing with users within SPA.

## Installation

```bash
npm install usermode
```

## Usage

```javascript
import { Usermode } from "usermode";

/**
 * Initialize Usermode
 * If the file does not exists, it will be created
 * @function init
 * @memberof Usermode
 * @static
 * @param {string} filepath
 * @returns {void}
 */
Usermode.init("./path/to/file.json");

/**
 * Add new user
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
    fullName: "User One", // optional
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
        update: {
            pass: "pass_2",
            fullename: "User One updated",
            __force: true, // false by default
        }
    }
);

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Coauthor

Теди (angelwaft)

## License
[MIT](https://choosealicense.com/licenses/mit/)
