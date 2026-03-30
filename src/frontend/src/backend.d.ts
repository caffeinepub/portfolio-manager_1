import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Holding {
    id: bigint;
    currentPrice: number;
    ticker: string;
    userId: Principal;
    name: string;
    avgCost: number;
    quantity: number;
    category: Category;
}
export interface UserProfile {
    name: string;
}
export interface Goal {
    id: bigint;
    userId: Principal;
    name: string;
    deadline: string;
    targetAmount: number;
    currentAmount: number;
}
export enum Category {
    etf = "etf",
    cash = "cash",
    stock = "stock",
    crypto = "crypto"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGoal(name: string, targetAmount: number, currentAmount: number, deadline: string): Promise<bigint>;
    addHolding(name: string, ticker: string, category: Category, quantity: number, avgCost: number, currentPrice: number): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerCategories(): Promise<Array<Category>>;
    getCallerGoals(): Promise<Array<Goal>>;
    getCallerHoldings(): Promise<Array<Holding>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeGoal(id: bigint): Promise<void>;
    removeHolding(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedSampleData(): Promise<void>;
    updateGoal(id: bigint, name: string, targetAmount: number, currentAmount: number, deadline: string): Promise<void>;
    updateHolding(id: bigint, name: string, ticker: string, category: Category, quantity: number, avgCost: number, currentPrice: number): Promise<void>;
}
