import proxyquire from "proxyquire";
import { fs } from "memfs";
import path from "path";
import { sha512_256 as sha } from "js-sha512";

const fsMock = {
  mkdirSync: fs.mkdirSync,
  rmdirSync: fs.rmdirSync,
  existsSync: fs.existsSync,
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
};

const { Usermode } = proxyquire("../src/index", {
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
    const userDataFalse = data.tedi;
    const userDataTrue = Usermode.getUser(data.tedi.username);
    userDataFalse.password = "wrong pass";
    const userTediFalse = Usermode.setUser(userDataFalse, {
      password: "new pass 1",
      fullname: "Tedi M",
    });
    const userTediTrue = Usermode.setUser(userDataTrue, {
      password: "pass-1",
      fullname: "Tedi M",
    });
    expect(userTediFalse).toBeUndefined();
    expect(userTediTrue).toBeInstanceOf(Object);
    const userTedi = Usermode.getUser(data.tedi.username);
    const filedata = fs.readFileSync(filepath);
    const userdata = JSON.parse(filedata.toString());
    expect(userdata.tedi.password).toEqual(userTedi.password);
    expect(userdata.tedi.fullname).toEqual(userTedi.fullname);
    expect(userTediTrue.password).toEqual(sha("pass-1"));
    expect(userTediTrue.fullname).toEqual("Tedi M");
    const userTediNoFullname = Usermode.setUser(userTediTrue, {
      password: "pass-2",
    });
    expect(userTediNoFullname.password).toEqual(sha("pass-2"));
    expect(userTediNoFullname.fullname).toEqual("Tedi M");
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
});
