'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">emergency-response-system documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' : 'data-bs-target="#xs-controllers-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' :
                                            'id="xs-controllers-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' : 'data-bs-target="#xs-injectables-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' :
                                        'id="xs-injectables-links-module-AppModule-23f027b81af1199533a33d47e573ba66d0dcd3f64ada6a8c1065fe04e86c9356b5a035239d745b407290af912cbf9ffa190e4009be13920434ba2b095c6b70b1"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' :
                                            'id="xs-controllers-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' :
                                        'id="xs-injectables-links-module-AuthModule-cad245308674775c30403a6b6dc73ef3465907a05d522523a19dc16d2c16f9740b10e052c49b7be6ef46ba7e47c9b910d7c4a339900d60bd2f794d0d40692255"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' : 'data-bs-target="#xs-controllers-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' :
                                            'id="xs-controllers-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' }>
                                            <li class="link">
                                                <a href="controllers/DashboardController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' : 'data-bs-target="#xs-injectables-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' :
                                        'id="xs-injectables-links-module-DashboardModule-2d18112f79ae4f8959b32f7929dfb72e115207119d4f914bd68087114e7c5dd0a3884d0b02cb7cfc2b266e77c03af97907f5e6ff0dc2e63ccf9d06ed16cbbc6d"' }>
                                        <li class="link">
                                            <a href="injectables/DashboardService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HospitalModule.html" data-type="entity-link" >HospitalModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' : 'data-bs-target="#xs-controllers-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' :
                                            'id="xs-controllers-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' }>
                                            <li class="link">
                                                <a href="controllers/HospitalController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HospitalController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' : 'data-bs-target="#xs-injectables-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' :
                                        'id="xs-injectables-links-module-HospitalModule-4ebb46d48331d2b64463169319b9ee43deb001c151da97bb01cd9b85e59aa223adc28f99c4e55a4351cfa7903c48cd0628015a16f4373b7ba6e259f55fdd7356"' }>
                                        <li class="link">
                                            <a href="injectables/HospitalService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HospitalService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationModule.html" data-type="entity-link" >NotificationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' : 'data-bs-target="#xs-controllers-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' :
                                            'id="xs-controllers-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' : 'data-bs-target="#xs-injectables-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' :
                                        'id="xs-injectables-links-module-NotificationModule-4b493f15b29329cc0bb0db160059aefa3c87ff5e07ae03e6834b90cfc692b9295ef6630f16fdcb7ab9faff142d6d5776eb95bd846a9a507afa8af20108426d51"' }>
                                        <li class="link">
                                            <a href="injectables/NotificationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PrismaModule-f6b2f47782fb797f29338700f3afe605699ace7c0f9e309e01d3b1a8ca2a2bf16bada1235237bd66910cbc6f83e7b75ef80823f8089314746067667639e60649"' : 'data-bs-target="#xs-injectables-links-module-PrismaModule-f6b2f47782fb797f29338700f3afe605699ace7c0f9e309e01d3b1a8ca2a2bf16bada1235237bd66910cbc6f83e7b75ef80823f8089314746067667639e60649"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-f6b2f47782fb797f29338700f3afe605699ace7c0f9e309e01d3b1a8ca2a2bf16bada1235237bd66910cbc6f83e7b75ef80823f8089314746067667639e60649"' :
                                        'id="xs-injectables-links-module-PrismaModule-f6b2f47782fb797f29338700f3afe605699ace7c0f9e309e01d3b1a8ca2a2bf16bada1235237bd66910cbc6f83e7b75ef80823f8089314746067667639e60649"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RescueModule.html" data-type="entity-link" >RescueModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' : 'data-bs-target="#xs-controllers-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' :
                                            'id="xs-controllers-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' }>
                                            <li class="link">
                                                <a href="controllers/RescueController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RescueController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' : 'data-bs-target="#xs-injectables-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' :
                                        'id="xs-injectables-links-module-RescueModule-e99f5dedefd4abd1b6f5669e3479236c340a0aa0ecaaba0a6003d7127453c33eaa317ce1afa1485f7851f5fcb7d5da2eedbdc404d49885cc7d419232e7049f02"' }>
                                        <li class="link">
                                            <a href="injectables/RescueService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RescueService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SosModule.html" data-type="entity-link" >SosModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' : 'data-bs-target="#xs-controllers-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' :
                                            'id="xs-controllers-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' }>
                                            <li class="link">
                                                <a href="controllers/SosController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SosController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' : 'data-bs-target="#xs-injectables-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' :
                                        'id="xs-injectables-links-module-SosModule-ef24af14a6cc5848142dbff95e7148f0d91de4a45a7aad26b9d6fe358fc3b4da9a14aa207d47942510d152d4818c1584591988b72ab4d1672eab07260b16ff2d"' }>
                                        <li class="link">
                                            <a href="injectables/SosService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SosService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SupabaseModule.html" data-type="entity-link" >SupabaseModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SupabaseModule-0e3136e827967840148e74aef5f58bf2feb94af3ce84eca075d0933d2aae7d6760ecf711414f8377b4d88ee1265fba1155533d539e63586a13ac461484c95584"' : 'data-bs-target="#xs-injectables-links-module-SupabaseModule-0e3136e827967840148e74aef5f58bf2feb94af3ce84eca075d0933d2aae7d6760ecf711414f8377b4d88ee1265fba1155533d539e63586a13ac461484c95584"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SupabaseModule-0e3136e827967840148e74aef5f58bf2feb94af3ce84eca075d0933d2aae7d6760ecf711414f8377b4d88ee1265fba1155533d539e63586a13ac461484c95584"' :
                                        'id="xs-injectables-links-module-SupabaseModule-0e3136e827967840148e74aef5f58bf2feb94af3ce84eca075d0933d2aae7d6760ecf711414f8377b4d88ee1265fba1155533d539e63586a13ac461484c95584"' }>
                                        <li class="link">
                                            <a href="injectables/SupabaseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SupabaseService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' : 'data-bs-target="#xs-controllers-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' :
                                            'id="xs-controllers-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' : 'data-bs-target="#xs-injectables-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' :
                                        'id="xs-injectables-links-module-UserModule-3562ebfc0146adbc829a0e1bd64528c69fee57a6993a18e22c3b867356abe604a7bf4a7dba81392b390008067b52c28942e9c19a25401bf74cafd52dfcd2a296"' }>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DashboardController.html" data-type="entity-link" >DashboardController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/HospitalController.html" data-type="entity-link" >HospitalController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/NotificationController.html" data-type="entity-link" >NotificationController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/RescueController.html" data-type="entity-link" >RescueController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SosController.html" data-type="entity-link" >SosController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UserController.html" data-type="entity-link" >UserController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AcceptEmergencyDto.html" data-type="entity-link" >AcceptEmergencyDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateEmergencyRequestDto.html" data-type="entity-link" >CreateEmergencyRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateHospitalDto.html" data-type="entity-link" >CreateHospitalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateNotificationDto.html" data-type="entity-link" >CreateNotificationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRescueTeamDto.html" data-type="entity-link" >CreateRescueTeamDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DashboardStatsResponseDto.html" data-type="entity-link" >DashboardStatsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/HttpExceptionFilter.html" data-type="entity-link" >HttpExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link" >LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MarkAsReadDto.html" data-type="entity-link" >MarkAsReadDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationGateway.html" data-type="entity-link" >NotificationGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/OAuthCallbackDto.html" data-type="entity-link" >OAuthCallbackDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OAuthLoginDto.html" data-type="entity-link" >OAuthLoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenDto.html" data-type="entity-link" >RefreshTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterDto.html" data-type="entity-link" >RegisterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReportQueryDto.html" data-type="entity-link" >ReportQueryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateEmergencyStatusDto.html" data-type="entity-link" >UpdateEmergencyStatusDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateHospitalCapacityDto.html" data-type="entity-link" >UpdateHospitalCapacityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateHospitalDto.html" data-type="entity-link" >UpdateHospitalDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProfileDto.html" data-type="entity-link" >UpdateProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRescueTeamDto.html" data-type="entity-link" >UpdateRescueTeamDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRescueTeamStatusDto.html" data-type="entity-link" >UpdateRescueTeamStatusDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserProfileResponseDto.html" data-type="entity-link" >UserProfileResponseDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppService.html" data-type="entity-link" >AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HospitalService.html" data-type="entity-link" >HospitalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationService.html" data-type="entity-link" >NotificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrismaService.html" data-type="entity-link" >PrismaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RescueService.html" data-type="entity-link" >RescueService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SosService.html" data-type="entity-link" >SosService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SupabaseService.html" data-type="entity-link" >SupabaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransformInterceptor.html" data-type="entity-link" >TransformInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthTokens.html" data-type="entity-link" >AuthTokens</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Response.html" data-type="entity-link" >Response</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupabaseUser.html" data-type="entity-link" >SupabaseUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenPayload.html" data-type="entity-link" >TokenPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenPayload-1.html" data-type="entity-link" >TokenPayload</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});