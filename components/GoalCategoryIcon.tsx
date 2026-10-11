import React from "react";
import {
  Laptop, Car, Plane, Home, Shield, GraduationCap,
  HeartPulse, Gift, Target, Sparkles, ShoppingBag, Briefcase
} from "lucide-react";

export const ICON_OPTIONS = [
  { id: "target", label: "Target", Icon: Target },
  { id: "laptop", label: "Technology", Icon: Laptop },
  { id: "car", label: "Vehicle", Icon: Car },
  { id: "plane", label: "Travel", Icon: Plane },
  { id: "home", label: "Home", Icon: Home },
  { id: "shield", label: "Emergency", Icon: Shield },
  { id: "graduation", label: "Education", Icon: GraduationCap },
  { id: "heart", label: "Health", Icon: HeartPulse },
  { id: "gift", label: "Gift", Icon: Gift },
  { id: "bag", label: "Shopping", Icon: ShoppingBag },
  { id: "briefcase", label: "Career", Icon: Briefcase }
];

export default function GoalCategoryIcon({
  icon = "target",
  category = "",
  size = 18,
  className = ""
}: {
  icon?: string;
  category?: string;
  size?: number;
  className?: string;
}) {
  const norm = (icon || category || "").toLowerCase();

  if (norm.includes("laptop") || norm.includes("tech") || norm === "\u{1F4BB}") {
    return <Laptop size={size} className={className} />;
  }
  if (norm.includes("car") || norm.includes("vehicle") || norm === "\u{1F697}") {
    return <Car size={size} className={className} />;
  }
  if (norm.includes("plane") || norm.includes("travel") || norm.includes("trip") || norm.includes("\u{2708}")) {
    return <Plane size={size} className={className} />;
  }
  if (norm.includes("home") || norm.includes("living") || norm === "\u{1F3E0}") {
    return <Home size={size} className={className} />;
  }
  if (norm.includes("shield") || norm.includes("emergency") || norm.includes("\u{1F6E1}")) {
    return <Shield size={size} className={className} />;
  }
  if (norm.includes("grad") || norm.includes("education") || norm === "\u{1F393}") {
    return <GraduationCap size={size} className={className} />;
  }
  if (norm.includes("heart") || norm.includes("health")) {
    return <HeartPulse size={size} className={className} />;
  }
  if (norm.includes("gift") || norm === "\u{1F381}") {
    return <Gift size={size} className={className} />;
  }
  if (norm.includes("bag") || norm.includes("shopping")) {
    return <ShoppingBag size={size} className={className} />;
  }
  if (norm.includes("briefcase") || norm.includes("work")) {
    return <Briefcase size={size} className={className} />;
  }
  if (norm.includes("sparkle") || norm.includes("personal")) {
    return <Sparkles size={size} className={className} />;
  }

  return <Target size={size} className={className} />;
}
