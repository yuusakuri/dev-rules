# ソフトウェア使用規則

## 1 はじめに

### 1.1 目的

本書の目的は、ソフトウェアの利用によるライセンス違反及びセキュリティインシデントの発生を防止することである。

### 1.2 適用範囲

本書は、開発で使用するソフトウェアの選定基準、並びに使用を許可するソフトウェア及び使用を禁止するソフトウェアについて規定する。

## 2 選定基準

使用を許可するソフトウェアは、[表1](#table-1)の基準を全て満たさなければならない。

<a id="table-1"></a>表1−ソフトウェアの選定基準

| 基準 | 内容 |
| --- | --- |
| 個人利用 | 個人利用が無料である。 |
| 商用利用 | 商用利用が無料である。 |
| 脆弱性への対応 | 重大な脆弱性が修正されずに放置されていない。 |

## 3 一覧の記載方法

ライセンスの列には、ライセンスの名称を記載する。

ソフトウェアの提供元のウェブサイト又はリポジトリにライセンスのページがある場合は、ライセンスの名称の後に改行し、そのページへのリンクを記載する。

## 4 使用を許可するソフトウェア

| ツール名 | ツール概要 | 提供元 | URL | プラットフォーム | ライセンス | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| Docker（Community Edition） | コンテナを構築、実行するためのコンテナエンジン。 | Docker Inc. | [Docker Engine \| Docker Docs](https://docs.docker.com/engine/) | Linux | Apache License 2.0<br>[moby/LICENSE at master · moby/moby · GitHub](https://github.com/moby/moby/blob/master/LICENSE) | Docker Desktopは使用を禁止する（[5章](#5-使用を禁止するソフトウェア)参照）。 |
| VMware Workstation Pro | 1台のPCで複数の仮想マシンを実行するデスクトップハイパーバイザー。 | Broadcom Inc. | [Fusion and Workstation \| VMware](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) | Windows<br>Linux | プロプライエタリ<br>[License and Service Terms & Repository](https://www.broadcom.com/company/legal/licensing) | 個人利用、教育利用及び商用利用のいずれも無料である（[VMware Fusion and Workstation are Now Free for All Users - VMware Cloud Foundation (VCF) Blog](https://blogs.vmware.com/cloud-foundation/2024/11/11/vmware-fusion-and-workstation-are-now-free-for-all-users/)参照）。<br>無料版は、Broadcomのサポート窓口の対象外である。<br>更新は、Broadcom Support Portalから最新版を入手して行う。 |
| VMware Fusion Pro | 1台のMacで複数の仮想マシンを実行するデスクトップハイパーバイザー。 | Broadcom Inc. | [Fusion and Workstation \| VMware](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) | macOS | プロプライエタリ<br>[License and Service Terms & Repository](https://www.broadcom.com/company/legal/licensing) | 個人利用、教育利用及び商用利用のいずれも無料である（[VMware Fusion and Workstation are Now Free for All Users - VMware Cloud Foundation (VCF) Blog](https://blogs.vmware.com/cloud-foundation/2024/11/11/vmware-fusion-and-workstation-are-now-free-for-all-users/)参照）。<br>無料版は、Broadcomのサポート窓口の対象外である。<br>更新は、Broadcom Support Portalから最新版を入手して行う。 |

## 5 使用を禁止するソフトウェア

| ツール名 | ツール概要 | 提供元 | URL | プラットフォーム | ライセンス | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| Oracle JDK | 無料の利用期間（NFTC）が過ぎた更新版は、OTNライセンスで提供され、商用の本番利用は有償になる。<br>有償契約のJava SE Universal Subscriptionでは、全従業員分の課金が必要である。 | Oracle Corporation | [Java Downloads \| Oracle](https://www.oracle.com/java/technologies/downloads/) | Windows<br>Linux<br>macOS | Oracle No-Fee Terms and Conditions<br>[Oracle No-Fee Terms and Conditions (NFTC) License Agreement](https://www.oracle.com/downloads/licenses/no-fee-license.html)<br>Oracle Technology Network License Agreement for Java SE<br>[Oracle Java SE License](https://www.oracle.com/downloads/licenses/javase-license1.html) | NFTCで提供中のバージョンも、無料の利用期間が過ぎた後の更新版は有償になる（[Oracle JDK Licenseに関する一般的なFAQ \| Oracle 日本](https://www.oracle.com/jp/java/technologies/javase/jdk-faqs.html)参照）。<br>課金方法は、[Java SE Universal Subscription \| Oracle](https://www.oracle.com/java/java-se-subscription/)参照。 |
| Docker Desktop | 2021年8月31日に利用条件が変更され、大企業での利用は有償である。<br>無料で利用できるのは、従業員数250名未満かつ年間売上高1,000万米ドル未満の企業と、非営利のオープンソースプロジェクトに限られる。 | Docker Inc. | [Docker Desktop \| Docker Docs](https://docs.docker.com/desktop/) | Windows<br>Linux<br>macOS | Docker Subscription Service Agreement<br>[Docker Subscription Service Agreement \| Docker](https://www.docker.com/legal/docker-subscription-service-agreement/) | 従業員数又は年間売上高のどちらかが基準を超えると、有償契約が必要になる（[Docker Plans FAQs \| Docker](https://www.docker.com/pricing/faq/)参照）。 |
| Visual Studio Community | 大企業では、オープンソースプロジェクトへの貢献、学術研究及び授業以外の利用が認められない。<br>大企業とは、PC又はユーザーが250を超えるか、年間売上高が100万米ドルを超える組織である。<br>大企業以外の組織でも、利用できるのは5ユーザーまでである。 | Microsoft Corporation | [Free IDE and Developer Tools - Visual Studio Community](https://visualstudio.microsoft.com/vs/community/) | Windows | Microsoft Software License Terms<br>[Visual Studio Licenses & EULA Directory](https://visualstudio.microsoft.com/license-terms/) | 大企業の判定では、関連会社を含めて数える。 |
| Lhaplus | 2017年5月3日に公開されたv1.74を最後に更新されていない。<br>ACE形式の展開に使うUNACEV2.DLLの脆弱性が、修正されていない可能性がある。 | Schezo | [HoeHoe.com](https://www7a.biglobe.ne.jp/~schezo/) | Windows | フリーウェア | [「Lhaplus」定番の圧縮・解凍ソフト - 窓の杜](https://forest.watch.impress.co.jp/library/software/lhaplus/)参照。 |
| VMware Workstation Player | 2024年4月30日に販売及び配布を終了し、後継のメジャーバージョンの公開後は更新されない。 | Broadcom Inc. | | Windows<br>Linux | | VMware Workstation Proを使用する（[4章](#4-使用を許可するソフトウェア)参照）。 |
| VMware Fusion Player | 2024年4月30日に販売及び配布を終了し、後継のメジャーバージョンの公開後は更新されない。 | Broadcom Inc. | | macOS | | VMware Fusion Proを使用する（[4章](#4-使用を許可するソフトウェア)参照）。 |
