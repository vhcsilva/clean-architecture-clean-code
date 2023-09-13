import AccountService from "../src/AccountService";
import RideService from "../src/RideService";

describe("RideService", () => {
  test("Should request a ride and return a ride id", async () => {
    const signUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const signUpOutput = await accountService.signup(signUpInput);
    const requestRideInput = {
      passengerId: signUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    expect(requestRideOutput.rideId).toBeDefined();
  });

  test("Should request a ride and have saved on the database", async () => {
    const signUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const signUpOutput = await accountService.signup(signUpInput);
    const requestRideInput = {
      passengerId: signUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    const getRideOutput = await rideService.getRide(requestRideOutput.rideId);
    expect(getRideOutput.passenger_id).toBe(requestRideInput.passengerId);
    expect(getRideOutput.status).toBe("requested");
    expect(parseFloat(getRideOutput.from_lat)).toBe(requestRideInput.from.lat);
    expect(parseFloat(getRideOutput.from_long)).toBe(requestRideInput.from.long);
    expect(parseFloat(getRideOutput.to_lat)).toBe(requestRideInput.to.lat);
    expect(parseFloat(getRideOutput.to_long)).toBe(requestRideInput.to.long);
  });

  test("Should not request a ride if user is not a passenger", async () => {
    const signUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true
    };
    const accountService = new AccountService();
    const signUpOutput = await accountService.signup(signUpInput);
    const requestRideInput = {
      passengerId: signUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    await expect(() => rideService.requestRide(requestRideInput)).rejects.toThrow(new Error("User is not a passenger"));
  });

  test("Should not request a ride if user has an active ride", async () => {
    const signUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const signUpOutput = await accountService.signup(signUpInput);
    const requestRideInput = {
      passengerId: signUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    await rideService.requestRide(requestRideInput);
    await expect(() => rideService.requestRide(requestRideInput)).rejects.toThrow(new Error("User already has an active ride"));
  });

  test("Should accept a ride and don't return", async () => {
    const passengerSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const passengerSignUpOutput = await accountService.signup(passengerSignUpInput);
    const driverSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true
    };
    const driverSignUpOutput = await accountService.signup(driverSignUpInput);
    const requestRideInput = {
      passengerId: passengerSignUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    const acceptRideInput = {
      rideId: requestRideOutput.rideId,
      driverId: driverSignUpOutput.accountId
    };
    await expect(rideService.acceptRide(acceptRideInput)).resolves.toBeUndefined();
  });

  test("Should accept a ride and have updated driver and status of the ride", async () => {
    const passengerSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const passengerSignUpOutput = await accountService.signup(passengerSignUpInput);
    const driverSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true
    };
    const driverSignUpOutput = await accountService.signup(driverSignUpInput);
    const requestRideInput = {
      passengerId: passengerSignUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    const acceptRideInput = {
      rideId: requestRideOutput.rideId,
      driverId: driverSignUpOutput.accountId
    };
    await rideService.acceptRide(acceptRideInput);
    const getRideOutput = await rideService.getRide(requestRideOutput.rideId);
    expect(getRideOutput.status).toBe("accepted");
    expect(getRideOutput.driver_id).toBe(acceptRideInput.driverId);
  });

  test("Should not accept a ride if user is not a driver", async () => {
    const passengerSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const passengerSignUpOutput = await accountService.signup(passengerSignUpInput);
    const driverSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const driverSignUpOutput = await accountService.signup(driverSignUpInput);
    const requestRideInput = {
      passengerId: passengerSignUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    const acceptRideInput = {
      rideId: requestRideOutput.rideId,
      driverId: driverSignUpOutput.accountId
    };
    await expect(() => rideService.acceptRide(acceptRideInput)).rejects.toThrow(new Error("User is not a driver"));
  });

  test("Should not accept a ride if status is not requested", async () => {
    const passengerSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const accountService = new AccountService();
    const passengerSignUpOutput = await accountService.signup(passengerSignUpInput);
    const driverSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true
    };
    const driverSignUpOutput = await accountService.signup(driverSignUpInput);
    const requestRideInput = {
      passengerId: passengerSignUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const rideService = new RideService();
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    const acceptRideInput = {
      rideId: requestRideOutput.rideId,
      driverId: driverSignUpOutput.accountId
    };
    await rideService.acceptRide(acceptRideInput);
    await expect(() => rideService.acceptRide(acceptRideInput)).rejects.toThrow(new Error("Ride isn't requested"));
  });

  test("Should not accept a ride if status is not requested", async () => {
    const accountService = new AccountService();
    const passengerSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const passengerSignUpOutput = await accountService.signup(passengerSignUpInput);
    const passengerSignUpInput2 = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true
    };
    const passengerSignUpOutput2 = await accountService.signup(passengerSignUpInput2);
    const driverSignUpInput = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true
    };
    const driverSignUpOutput = await accountService.signup(driverSignUpInput);
    const rideService = new RideService();
    const requestRideInput = {
      passengerId: passengerSignUpOutput.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const requestRideOutput = await rideService.requestRide(requestRideInput);
    const requestRideInput2 = {
      passengerId: passengerSignUpOutput2.accountId,
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    };
    const requestRideOutput2 = await rideService.requestRide(requestRideInput2);
    const acceptRideInput = {
      rideId: requestRideOutput.rideId,
      driverId: driverSignUpOutput.accountId
    };
    await rideService.acceptRide(acceptRideInput);
    const acceptRideInput2 = {
      rideId: requestRideOutput2.rideId,
      driverId: driverSignUpOutput.accountId
    };
    await expect(() => rideService.acceptRide(acceptRideInput2)).rejects.toThrow(new Error("Driver already has an active ride"));
  });
});