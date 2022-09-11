#!/bin/bash

set -ox errexit

display_usage() {
    echo
    echo "USAGE: ./build-services.sh <version> <prefix> [-h|--help]"
    echo "    -h|--help: Prints usage information"
    echo "    version:   Version of the sample app images (Required)"
    echo "    prefix:    Use the value as the prefix for image names (Required)"
    exit 1
}

if [ "$#" -ne 2 ]; then
  if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    display_usage
  else
    echo "Incorrect parameters"
    display_usage
  fi
fi

VERSION=$1
PREFIX=$2
SCRIPTDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Docker build variables
ENABLE_MULTIARCH_IMAGES=${ENABLE_MULTIARCH_IMAGES:-"false"}

if [ "${ENABLE_MULTIARCH_IMAGES}" == "true" ]; then
  PLATFORMS="linux/arm64,linux/amd64"	
  DOCKER_BUILD_ARGS="docker buildx build --platform ${PLATFORMS} --push"
  # Install QEMU emulators
  docker run --rm --privileged tonistiigi/binfmt --install all
  docker buildx rm multi-builder || :
  docker buildx create --use --name multi-builder --platform ${PLATFORMS}
  docker buildx use multi-builder
else
  DOCKER_BUILD_ARGS="docker build"	
fi

pushd "$SCRIPTDIR/productpage"
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-productpage-v1:${VERSION}" -t "${PREFIX}/product-info-productpage-v1:latest" .
  #flooding
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-productpage-v-flooding:${VERSION}" -t "${PREFIX}/product-info-productpage-v-flooding:latest" --build-arg flood_factor=100 .
popd

pushd "$SCRIPTDIR/details"
  #plain build -- no calling external book service to fetch topics
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-details-v1:${VERSION}" -t "${PREFIX}/product-info-details-v1:latest" --build-arg service_version=v1 .
  #with calling external book service to fetch topic for the book
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-details-v2:${VERSION}" -t "${PREFIX}/product-info-details-v2:latest" --build-arg service_version=v2 \
	 --build-arg enable_external_book_service=true .
popd


pushd "$SCRIPTDIR/reviews"
  #java build the app.
  docker run --rm -u root -v "$(pwd)":/home/gradle/project -w /home/gradle/project gradle:4.8.1 gradle clean build
  
  pushd reviews-wlpcfg
    #plain build -- no ratings
    ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-reviews-v1:${VERSION}" -t "${PREFIX}/product-info-reviews-v1:latest" --build-arg service_version=v1 . 
    #with ratings black stars
    ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-reviews-v2:${VERSION}" -t "${PREFIX}/product-info-reviews-v2:latest" --build-arg service_version=v2 \
	   --build-arg enable_ratings=true .
    #with ratings red stars
    ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-reviews-v3:${VERSION}" -t "${PREFIX}/product-info-reviews-v3:latest" --build-arg service_version=v3 \
	   --build-arg enable_ratings=true --build-arg star_color=red .
  popd
popd

pushd "$SCRIPTDIR/ratings"
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-ratings-v1:${VERSION}" -t "${PREFIX}/product-info-ratings-v1:latest" --build-arg service_version=v1 .
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-ratings-v2:${VERSION}" -t "${PREFIX}/product-info-ratings-v2:latest" --build-arg service_version=v2 .
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-ratings-v-faulty:${VERSION}" -t "${PREFIX}/product-info-ratings-v-faulty:latest" --build-arg service_version=v-faulty .
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-ratings-v-delayed:${VERSION}" -t "${PREFIX}/product-info-ratings-v-delayed:latest" --build-arg service_version=v-delayed .
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-ratings-v-unavailable:${VERSION}" -t "${PREFIX}/product-info-ratings-v-unavailable:latest" --build-arg service_version=v-unavailable .
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-ratings-v-unhealthy:${VERSION}" -t "${PREFIX}/product-info-ratings-v-unhealthy:latest" --build-arg service_version=v-unhealthy .
popd

pushd "$SCRIPTDIR/mysql"
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-mysqldb:${VERSION}" -t "${PREFIX}/product-info-mysqldb:latest" .
popd

pushd "$SCRIPTDIR/mongodb"
  ${DOCKER_BUILD_ARGS} --pull -t "${PREFIX}/product-info-mongodb:${VERSION}" -t "${PREFIX}/product-info-mongodb:latest" .
popd
