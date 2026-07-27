#!/usr/bin/env python3
"""
Reference runner that loads the dashboard's generated prompt (or a file)
and executes it with browser-use.

Usage:
  export BROWSER_USE_API_KEY=...
  # or OPENAI_API_KEY / ANTHROPIC_API_KEY

  python python/agent_runner.py --prompt-file /tmp/apply-prompt.txt
  python python/agent_runner.py --prompt "Go to LinkedIn and ..."
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

try:
    from browser_use import Agent, Browser, ChatBrowserUse
except ImportError:
    print("browser-use not installed. Run: pip install browser-use && browser-use install")
    sys.exit(1)


async def run(prompt: str, use_real_chrome: bool = True) -> None:
    if use_real_chrome:
        try:
            browser = Browser.from_system_chrome()
        except Exception as e:
            print(f"Could not attach to system Chrome ({e}); falling back to local Chromium")
            browser = Browser()
    else:
        browser = Browser()

    llm = ChatBrowserUse()
    agent = Agent(task=prompt, llm=llm, browser=browser)
    history = await agent.run()
    print("\n===== AGENT FINISHED =====")
    if hasattr(history, "final_result"):
        print(history.final_result())
    else:
        print(history)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run job-apply-agent prompt with browser-use")
    parser.add_argument("--prompt", type=str, help="Inline prompt text")
    parser.add_argument("--prompt-file", type=Path, help="Path to a text file containing the prompt")
    parser.add_argument(
        "--no-real-chrome",
        action="store_true",
        help="Do not use system Chrome profile",
    )
    args = parser.parse_args()

    if args.prompt_file:
        prompt = args.prompt_file.read_text(encoding="utf-8")
    elif args.prompt:
        prompt = args.prompt
    else:
        print("Provide --prompt or --prompt-file")
        sys.exit(1)

    asyncio.run(run(prompt, use_real_chrome=not args.no_real_chrome))


if __name__ == "__main__":
    main()
