<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Extbase\Validation\Validator;

use TYPO3\CMS\Extbase\Validation\Exception\InvalidValidationOptionsException;

/**
 * Validator for string length.
 */
final class StringLengthValidator extends AbstractValidator
{
    protected string $betweenMessage = 'LLL:EXT:extbase/Resources/Private/Language/locallang.xlf:validator.stringlength.between';
    protected string $lessMessage = 'LLL:EXT:extbase/Resources/Private/Language/locallang.xlf:validator.stringlength.less';
    protected string $exceedMessage = 'LLL:EXT:extbase/Resources/Private/Language/locallang.xlf:validator.stringlength.exceed';

    protected array $translationOptions = ['betweenMessage', 'lessMessage', 'exceedMessage'];

    /**
     * @var array
     */
    protected $supportedOptions = [
        'minimum' => [0, 'Minimum length for a valid string', 'integer'],
        'maximum' => [PHP_INT_MAX, 'Maximum length for a valid string', 'integer'],
        'betweenMessage' => [null, 'Translation key or message for value not between minimum and maximum', 'string'],
        'lessMessage' => [null, 'Translation key or message for value less than minimum', 'string'],
        'exceedMessage' => [null, 'Translation key or message for value exceeds maximum', 'string'],
    ];

    /**
     * Checks if the given value is a valid string (or can be cast to a string
     * if an object is given) and its length is between minimum and maximum
     * specified in the validation options.
     *
     * @throws InvalidValidationOptionsException
     */
    public function isValid(mixed $value): void
    {
        if ($this->options['maximum'] < $this->options['minimum']) {
            throw new InvalidValidationOptionsException('The \'maximum\' is shorter than the \'minimum\' in the StringLengthValidator.', 1238107096);
        }

        if (is_object($value)) {
            if (!method_exists($value, '__toString')) {
                $this->addError('The given object could not be converted to a string.', 1238110957);
                return;
            }
        } elseif (!is_string($value)) {
            $this->addError('The given value was not a valid string.', 1269883975);
            return;
        }

        $value = (string)$value;
        $stringLength = mb_strlen($value, 'utf-8');
        $isValid = true;
        if ($stringLength < $this->options['minimum']) {
            $isValid = false;
        }
        if ($stringLength > $this->options['maximum']) {
            $isValid = false;
        }

        if ($isValid === false) {
            if ($this->options['minimum'] > 0 && $this->options['maximum'] < PHP_INT_MAX) {
                $this->addError(
                    $this->translateErrorMessage(
                        $this->betweenMessage,
                        '',
                        [
                            $this->options['minimum'],
                            $this->options['maximum'],
                        ]
                    ),
                    1428504122,
                    [$this->options['minimum'], $this->options['maximum']]
                );
            } elseif ($this->options['minimum'] > 0) {
                $this->addError(
                    $this->translateErrorMessage(
                        $this->lessMessage,
                        '',
                        [
                            $this->options['minimum'],
                        ]
                    ),
                    1238108068,
                    [$this->options['minimum']]
                );
            } else {
                $this->addError(
                    $this->translateErrorMessage(
                        $this->exceedMessage,
                        '',
                        [
                            $this->options['maximum'],
                        ]
                    ),
                    1238108069,
                    [$this->options['maximum']]
                );
            }
        }
    }
}
