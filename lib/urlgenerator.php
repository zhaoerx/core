<?php
/**
 * Copyright (c) 2013 Bart Visscher <bartv@thisnet.nl>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 *
 */

namespace OC;

/**
 * Class to generate URLs
 */
class URLGenerator {
	/**
	 * @brief Creates an url using a defined route
	 * @param $route
	 * @param array $parameters
	 * @return
	 * @internal param array $args with param=>value, will be appended to the returned url
	 * @returns the url
	 *
	 * Returns a url to the given app and file.
	 */
	public function linkToRoute($route, $parameters = array()) {
		$urlLinkTo = \OC::getRouter()->generate($route, $parameters);
		return $urlLinkTo;
	}

	/**
	 * @brief Creates an url
	 * @param string $app app
	 * @param string $file file
	 * @param array $args array with param=>value, will be appended to the returned url
	 *    The value of $args will be urlencoded
	 * @return string the url
	 *
	 * Returns a url to the given app and file.
	 */
	public function linkTo( $app, $file, $args = array() ) {
		if( $app != '' ) {
			$app_path = \OC_App::getAppPath($app);
			// Check if the app is in the app folder
			if ($app_path && file_exists($app_path . '/' . $file)) {
				if (substr($file, -3) == 'php' || substr($file, -3) == 'css') {
					$urlLinkTo = \OC::$WEBROOT . '/index.php/apps/' . $app;
					$urlLinkTo .= ($file != 'index.php') ? '/' . $file : '';
				} else {
					$urlLinkTo = \OC_App::getAppWebPath($app) . '/' . $file;
				}
			} else {
				$urlLinkTo = \OC::$WEBROOT . '/' . $app . '/' . $file;
			}
		} else {
			if (file_exists(\OC::$SERVERROOT . '/core/' . $file)) {
				$urlLinkTo = \OC::$WEBROOT . '/core/' . $file;
			} else {
				$urlLinkTo = \OC::$WEBROOT . '/' . $file;
			}
		}

		if ($args && $query = http_build_query($args, '', '&')) {
			$urlLinkTo .= '?' . $query;
		}

		return $urlLinkTo;
	}

	/**
	 * @brief Creates path to an image
	 * @param string $app app
	 * @param string $image image name
	 * @return string the url
	 *
	 * Returns the path to the image.
	 */
	public function imagePath($app, $image) {
		// Read the selected theme from the config file
		$theme = \OC_Util::getTheme();

		// Check if the app is in the app folder
		if (file_exists(\OC::$SERVERROOT . "/themes/$theme/apps/$app/img/$image")) {
			return \OC::$WEBROOT . "/themes/$theme/apps/$app/img/$image";
		} elseif (file_exists(\OC_App::getAppPath($app) . "/img/$image")) {
			return \OC_App::getAppWebPath($app) . "/img/$image";
		} elseif (!empty($app) and file_exists(\OC::$SERVERROOT . "/themes/$theme/$app/img/$image")) {
			return \OC::$WEBROOT . "/themes/$theme/$app/img/$image";
		} elseif (!empty($app) and file_exists(\OC::$SERVERROOT . "/$app/img/$image")) {
			return \OC::$WEBROOT . "/$app/img/$image";
		} elseif (file_exists(\OC::$SERVERROOT . "/themes/$theme/core/img/$image")) {
			return \OC::$WEBROOT . "/themes/$theme/core/img/$image";
		} elseif (file_exists(\OC::$SERVERROOT . "/core/img/$image")) {
			return \OC::$WEBROOT . "/core/img/$image";
		} else {
			throw new RuntimeException('image not found: image:' . $image . ' webroot:' . \OC::$WEBROOT . ' serverroot:' . \OC::$SERVERROOT);
		}
	}

	/**
	 * @brief Makes an $url absolute
	 * @param string $url the url
	 * @return string the absolute url
	 *
	 * Returns a absolute url to the given app and file.
	 */
	public function makeURLAbsolute($url) {
		return \OC_Request::serverProtocol() . '://' . \OC_Request::serverHost() . $url;
	}

}
