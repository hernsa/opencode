#!/usr/bin/env bash
# render-homebrew.sh <sign-macos dir> <build-archives dir> <tap dir>: writes Formula ocnano-v2.rb with the
# hashes of the signed macOS and the Linux archives.
. "$(dirname "$0")/lib.sh"

macos=$1 archives=$2 tap=$3
sum() { sha256 "$1" | cut -c1-64; }
base="https://opencode.ai/files/bin/$OCNANO_VERSION"
cat > "$tap/ocnano-v2.rb" <<FORMULA
# typed: false
# frozen_string_literal: true

class OpencodeV2 < Formula
  desc "OC Nano V2 - the AI coding agent for the terminal"
  homepage "https://github.com/anomalyco/opencode"
  version "$OCNANO_VERSION"
  license "MIT"

  depends_on "ripgrep"
  conflicts_with "ocnano", because: "both install an ocnano binary"

  on_macos do
    if Hardware::CPU.arm?
      url "$base/ocnano-darwin-arm64.zip"
      sha256 "$(sum "$macos/ocnano-darwin-arm64.zip")"
    else
      url "$base/ocnano-darwin-x64-baseline.zip"
      sha256 "$(sum "$macos/ocnano-darwin-x64-baseline.zip")"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "$base/ocnano-linux-arm64.tar.gz"
      sha256 "$(sum "$archives/ocnano-linux-arm64.tar.gz")"
    else
      url "$base/ocnano-linux-x64-baseline.tar.gz"
      sha256 "$(sum "$archives/ocnano-linux-x64-baseline.tar.gz")"
    end
  end

  def install
    bin.install "ocnano"
  end
end
FORMULA
cat "$tap/ocnano-v2.rb"
