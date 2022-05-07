const proxyquire = require("proxyquire");
const fs = require("memfs");
const path = require("path");
const { sha512_256: sha } = require("js-sha512");

const fsMock = {
  mkdirSync: fs.mkdirSync,
  rmdirSync: fs.rmdirSync,
  existsSync: fs.existsSync,
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
};

const { Usermode } = proxyquire("../src/index.ts", {
  fs: fsMock,
});

const data = {
  tedi: {
    password:
      "cbcc471e62b827c234217d824a1e045743824c8b11ffdb371d203c3bad966d12", // pass-1
    username: "tedi",
    fullname: "Teodora",
  },
  vidul: {
    password:
      "c6598b3dfe966d4e7ae60caa34b96eea18fd83cafb245ab0afb454e8d970b8d5", // pass-2
    username: "vidul",
    fullname: "VNP",
  },
  __misc: {
    passHash:
      "b354786a5222a19437a564af0e3db78c85cf58f2d5ebc0074cd5d8b1abd041bd", // pass
  },
};

const filepath = "/data.json";

describe("File content", () => {
  beforeEach(() => {
    fs.writeFileSync(filepath, JSON.stringify(data));
  });

  afterEach(() => {
    fs.unlinkSync(filepath);
  });

  it("file content", () => {
    const userdata = fs.readFileSync(filepath);
    expect(userdata.toString()).toMatch(JSON.stringify(data));
  });
});

describe("Usermode", () => {
  beforeEach(() => {
    fs.writeFileSync(filepath, JSON.stringify(data));
    Usermode.init(filepath);
  });

  afterEach(() => {
    fs.unlinkSync(filepath);
    Object.keys(data).forEach((username) => {
      const homePath = path.join(path.dirname(filepath), username);
      fs.existsSync(homePath) && fs.rmdirSync(homePath);
    });
  });

  it("file content", () => {
    const userdata = fs.readFileSync(filepath);
    expect(userdata.toString()).toMatch(JSON.stringify(data));
  });

  it("constructor", () => {
    expect(Usermode.users).toEqual(data);
  });

  it("get user by name", () => {
    const userTedi = Usermode.getUser(data.tedi.username);
    const userVidul = Usermode.getUser(data.vidul.username);
    const userNone = Usermode.getUser("none");
    expect(userTedi.username).toEqual(data.tedi.username);
    expect(userVidul.username).toEqual(data.vidul.username);
    expect(userNone).toBeFalsy();
  });

  it("set user by name", () => {
    const userData = Usermode.getUser(data.tedi.username);
    const user = Usermode.setUser(userData, {
      password: "new pass",
      fullname: "Tedi M",
      __force: true,
    });
    expect(user.username).toEqual(userData.username);
    expect(user.password).toEqual(sha("new pass"));
    expect(user.fullname).toEqual("Tedi M");
    expect(() => Usermode.setUser({ username: "N/A" })).toThrow(
      new Error('Username "N/A" does not exist!')
    );
    expect(() =>
      Usermode.setUser(
        {
          username: user.username,
          password: "N/A",
        },
        { password: "pass-3", fullname: "New fullname" }
      )
    ).toThrow(new Error('Password "N/A" does not match!'));

    const filedata = fs.readFileSync(filepath);
    const userdata = JSON.parse(filedata.toString());
    expect(user.username).toEqual(userdata.tedi.username);
    expect(user.password).toEqual(userdata.tedi.password);
    expect(user.fullname).toEqual(userdata.tedi.fullname);
  });

  it("add user", () => {
    const username = "tester";
    const password = "pass";
    const fullname = "Jasmine unit test";
    const user = Usermode.addUser({ username, password, fullname });
    const filedata = fs.readFileSync(filepath);
    const userdata = JSON.parse(filedata.toString());
    expect(user.username).toEqual(username);
    expect(userdata.tester.username).toEqual(user.username);
    expect(userdata.tester.password).toEqual(user.password);
    expect(userdata.tester.fullname).toEqual(user.fullname);
    expect(user.password).toEqual(data.__misc.passHash);
  });

  it("add user twice", () => {
    const username = "tester";
    const password = "pass";
    Usermode.addUser({ username, password });
    expect(() => Usermode.addUser({ username, password })).toThrow(
      new Error('Username "tester" already exists!')
    );
  });

  it("check missing home directiry", () => {
    const user = Usermode.getUser(data.vidul.username);
    const homePath = Usermode.getHome(user.username);
    expect(fs.existsSync(homePath)).toBeFalse();
  });

  it("create home directiry", () => {
    const user = Usermode.getUser(data.vidul.username);
    const homePath = Usermode.setHome(user.username);
    expect(fs.existsSync(homePath)).toBeTrue();
    expect(Usermode.getHome(user.username)).toEqual(homePath);
  });

  it("check password match", () => {
    const matchTrue = Usermode.passMatch(data.vidul.username, "pass-2");
    const matchFalse = Usermode.passMatch(data.vidul.username, "2-pass");
    expect(matchTrue).toBeTrue();
    expect(matchFalse).toBeFalse();
  });
});
