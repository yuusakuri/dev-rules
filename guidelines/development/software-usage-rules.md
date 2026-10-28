# ソフトウェア使用規則

## 目次

- [1 はじめに](#1-はじめに)
- [2 選定基準](#2-選定基準)
- [3 一覧の記載方法](#3-一覧の記載方法)
- [4 使用を許可するソフトウェア](#4-使用を許可するソフトウェア)
- [5 使用を禁止するソフトウェア](#5-使用を禁止するソフトウェア)

## 1 はじめに

### 1.1 目的

本書の目的は，ソフトウェアの利用によるライセンス違反及びセキュリティインシデントの発生を防止することである。

### 1.2 適用範囲

本書は，開発で使用するソフトウェアの選定基準，並びに使用を許可するソフトウェア及び使用を禁止するソフトウェアについて規定する。

## 2 選定基準

使用を許可するソフトウェアは，[表1](#table-1)の基準を全て満たさなければならない。

<a id="table-1"></a>表1−ソフトウェアの選定基準

| 基準 | 内容 |
| --- | --- |
| 個人利用 | 個人利用が無料である。 |
| 商用利用 | 商用利用が無料である。 |
| 脆弱性への対応 | 重大な脆弱性が修正されずに放置されていない。 |

## 3 一覧の記載方法

ライセンスの列には，ライセンスの名称を記載する。

ソフトウェアの提供元のウェブサイト又はリポジトリにライセンスのページがある場合は，ライセンスの名称の後に改行し，そのページへのリンクを記載する。

## 4 使用を許可するソフトウェア

| ツール名 | ツール概要 | 提供元 | URL | プラットフォーム | ライセンス | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| Docker（Community Edition） | コンテナを構築，実行するためのコンテナエンジン。 | Docker Inc. | [Docker Engine \| Docker Docs](https://docs.docker.com/engine/) | Linux | Apache License 2.0<br>[moby/LICENSE at master · moby/moby · GitHub](https://github.com/moby/moby/blob/master/LICENSE) | Docker Desktopは使用を禁止する（[5章](#5-使用を禁止するソフトウェア)参照）。 |
| VMware Workstation Pro | 1台のPCで複数の仮想マシンを実行するデスクトップハイパーバイザー。 | Broadcom Inc. | [Fusion and Workstation \| VMware](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) | Windows<br>Linux | プロプライエタリ<br>[License and Service Terms & Repository](https://www.broadcom.com/company/legal/licensing) | 個人利用，教育利用及び商用利用のいずれも無料である（[VMware Fusion and Workstation are Now Free for All Users - VMware Cloud Foundation (VCF) Blog](https://blogs.vmware.com/cloud-foundation/2024/11/11/vmware-fusion-and-workstation-are-now-free-for-all-users/)参照）。<br>無料版は，Broadcomのサポート窓口の対象外である。<br>更新は，Broadcom Support Portalから最新版を入手して行う。 |
| VMware Fusion Pro | 1台のMacで複数の仮想マシンを実行するデスクトップハイパーバイザー。 | Broadcom Inc. | [Fusion and Workstation \| VMware](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) | macOS | プロプライエタリ<br>[License and Service Terms & Repository](https://www.broadcom.com/company/legal/licensing) | 個人利用，教育利用及び商用利用のいずれも無料である（[VMware Fusion and Workstation are Now Free for All Users - VMware Cloud Foundation (VCF) Blog](https://blogs.vmware.com/cloud-foundation/2024/11/11/vmware-fusion-and-workstation-are-now-free-for-all-users/)参照）。<br>無料版は，Broadcomのサポート窓口の対象外である。<br>更新は，Broadcom Support Portalから最新版を入手して行う。 |

## 5 使用を禁止するソフトウェア

| ツール名 | ツール概要 | 提供元 | URL | プラットフォーム | ライセンス | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| Oracle Java（ver.17以前）<br>※ver.21以降も条件付き | 公開から一定期間経ったバージョンは2023年より有償化されています。<br>「1人でも利用すると全従業員（5000名＋社外スタッフ）分の課金が発生」という契約体系のため安易にインストールしないでください。 | ORACLE | ライセンスFAQ<br>[Oracle JDK Licenseに関する一般的なFAQ \| Oracle 日本](https://www.oracle.com/jp/java/technologies/javase/jdk-faqs.html) | | | |
| Docker Desktop | 2021年より有償化されています。<br>無償で利用可能なのは従業員数250名までの企業に限定されています。 | Docker Inc. | | | | |
| Visual Studio Community | 小規模事業者のみが無償となるライセンスです。<br>PC台数またはユーザー数が 250未満<br>年間の売上高が 100万米ドル（約1.5億円）未満 | Microsoft Corp. | | | | |
| Lhaplus | 脆弱性がありアップデートされていないため利用禁止 | | | | | |
| VMware Workstation Player | 2024年4月30日に販売及び配布を終了し，後継のメジャーバージョンの公開後は更新されない。 | Broadcom Inc. | | Windows<br>Linux | | VMware Workstation Proを使用する（[4章](#4-使用を許可するソフトウェア)参照）。 |
| VMware Fusion Player | 2024年4月30日に販売及び配布を終了し，後継のメジャーバージョンの公開後は更新されない。 | Broadcom Inc. | | macOS | | VMware Fusion Proを使用する（[4章](#4-使用を許可するソフトウェア)参照）。 |
