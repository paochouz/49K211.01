import { Router } from "express";
import { createCustomer, listCustomers } from "../controllers/customerController";
import { validateCreateCustomer } from "../validators/customerValidator";

export const customerRoutes = Router();

customerRoutes.get("/", listCustomers);
customerRoutes.post("/", validateCreateCustomer, createCustomer);

