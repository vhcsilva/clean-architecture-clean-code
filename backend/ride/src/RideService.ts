import pgp from "pg-promise";
import crypto from "crypto";
import AccountService from "./AccountService";

export default class RideService {
  accountService: AccountService;

  constructor () {
    this.accountService = new AccountService();
  }

  async requestRide(input: any) {
    const connection = pgp()("postgres://postgres:123@localhost:5433/app");
    try {
      const account = await this.accountService.getAccount(input.passengerId);
      if (!account.is_passenger) throw new Error("User is not a passenger");
      const activeRides = await this.getActiveRidesOfByPassengerId(input.passengerId);
      if (activeRides.length) throw new Error("User already has an active ride");
      const rideId = crypto.randomUUID();
      const rideDate = new Date();
      await connection.query("insert into cccat13.ride (ride_id, passenger_id, from_lat, from_long, to_lat, to_long, date, status) values ($1, $2, $3, $4, $5, $6, $7, $8)", 
        [rideId, input.passengerId, input.from.lat, input.from.long, input.to.lat, input.to.long, rideDate, "requested"]);
      return {
        rideId
      };
    } finally {
      await connection.$pool.end();
    }
  }

  async acceptRide(input: any) {
    const connection = pgp()("postgres://postgres:123@localhost:5433/app");
    try {
      const account = await this.accountService.getAccount(input.driverId);
      if (!account.is_driver) throw new Error("User is not a driver");
      const ride = await this.getRide(input.rideId);
      if (ride.status !== "requested") throw new Error("Ride isn't requested");
      const activeRides = await this.getActiveRidesOfByDriverId(input.driverId);
      if (activeRides.length) throw new Error("Driver already has an active ride");
      await connection.query("update cccat13.ride set status = 'accepted', driver_id = $1 where ride_id = $2", [input.driverId, input.rideId]);
    } finally {
      await connection.$pool.end();
    }
  }

  async getRide(rideId: any) {
    const connection = pgp()("postgres://postgres:123@localhost:5433/app");
		const [ride] = await connection.query("select * from cccat13.ride where ride_id = $1", [rideId]);
		await connection.$pool.end();
		return ride;
  }

  async getActiveRidesOfByPassengerId(passengerId: any) {
    const connection = pgp()("postgres://postgres:123@localhost:5433/app");
		const rides = await connection.query("select * from cccat13.ride where passenger_id = $1 and status <> 'completed'", [passengerId]);
		await connection.$pool.end();
		return rides;
  }

  async getActiveRidesOfByDriverId(driverId: any) {
    const connection = pgp()("postgres://postgres:123@localhost:5433/app");
		const rides = await connection.query("select * from cccat13.ride where driver_id = $1 and status in ('accepted', 'in_progress')", [driverId]);
		await connection.$pool.end();
		return rides;
  }
}