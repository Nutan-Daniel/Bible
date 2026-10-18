// @ts-nocheck
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "../../components/Layout";

let currentSettings: any = {
  id: 1,
  fontSize: "md",
  fontFamily: "serif",
  theme: "light",
  lineSpacing: 1.6,
  defaultTranslation: "web",
  activePlanId: null,
};
let capturedUpdate: any;

vi.mock("../../hooks/useSettings", () => {
  const { useState, useEffect } = require("react");
  const listeners = new Set<(s: any) => void>();
  return {
    useSettings: () => {
      const [settings, setSettings] = useState(currentSettings);
      useEffect(() => {
        listeners.add(setSettings);
        return () => listeners.delete(setSettings);
      }, []);
      capturedUpdate = async (patch: any) => {
        currentSettings = { ...currentSettings, ...patch };
        listeners.forEach((fn) => fn(currentSettings));
      };
      return { settings, loading: false, update: capturedUpdate };
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  currentSettings = {
    id: 1,
    fontSize: "md",
    fontFamily: "serif",
    theme: "light",
    lineSpacing: 1.6,
    defaultTranslation: "web",
    activePlanId: null,
  };
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

describe("Layout theme", () => {
  it("does not add dark class for light theme", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Layout>Children</Layout>
      </MemoryRouter>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("adds dark class for dark theme on first render", () => {
    currentSettings.theme = "dark";
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Layout>Children</Layout>
      </MemoryRouter>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles dark class when theme changes without refresh", async () => {
    currentSettings.theme = "light";
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Layout>Children</Layout>
      </MemoryRouter>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await act(async () => {
      await capturedUpdate({ theme: "dark" });
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await act(async () => {
      await capturedUpdate({ theme: "light" });
    });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
