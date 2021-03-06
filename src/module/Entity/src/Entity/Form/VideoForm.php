<?php
/**
 * Athene2 - Advanced Learning Resources Manager
 *
 * @author         Aeneas Rekkas (aeneas.rekkas@serlo.org)
 * @license   http://www.apache.org/licenses/LICENSE-2.0  Apache License 2.0
 * @link           https://github.com/serlo-org/athene2 for the canonical source repository
 * @copyright      Copyright (c) 2013 Gesellschaft f√ºr freie Bildung e.V. (http://www.open-education.eu/)
 */
namespace Entity\Form;

use License\Entity\LicenseInterface;
use License\Form\AgreementFieldset;
use Zend\Form\Element\Text;
use Zend\Form\Element\Textarea;
use Zend\Form\Element\Url;
use Zend\Form\Form;
use Zend\InputFilter\InputFilter;
use Zend\Validator\Regex;

class VideoForm extends Form
{

    function __construct(LicenseInterface $license)
    {
        parent::__construct('video');
        $this->setAttribute('method', 'post');
        $this->setAttribute('class', 'clearfix');

        $this->add((new Text('title'))->setAttribute('id', 'title')->setLabel('Title:'));
        $this->add((new Textarea('description'))->setAttribute('id', 'description')->setLabel('Description:'));
        $this->add((new Url('content'))->setAttribute('id', 'content')->setLabel('Video url:'));
        $this->add(
            (new Textarea('reasoning'))->setAttribute('id', 'reasoning')->setLabel('Reasoning:')
        );
        $this->add(
            (new Textarea('changes'))->setAttribute('id', 'changes')->setLabel('Changes:')->setAttribute(
                'class',
                'plain'
            )
        );
        $this->add(new AgreementFieldset($license));
        $this->add(new Controls());

        $inputFilter = new InputFilter('video');
        $inputFilter->add(['name' => 'title', 'required' => true, 'filters' => [['name' => 'StripTags']]]);
        $inputFilter->add(
            [
                'name' => 'content',
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StripTags'
                    ]
                ],
                'validators' => [
                    [
                        'name'  => 'Regex',
                        'options' => [
                            'pattern' => '~^(https?:\/\/)?(.*?(youtube\.com\/watch\?v=.+|youtu\.be\/.+|vimeo\.com\/.+|upload\.wikimedia\.org\/.+(\.webm|\.ogg)?))~',
                            'messages' => [
                                Regex::NOT_MATCH => 'Video-URL invalid, supported platforms are Youtube, Vimeo and Wikimedia Commons'
                            ]
                        ]
                    ]
                ]
            ]);
        $inputFilter->add(['name' => 'reasoning', 'required' => false, 'filters' => [['name' => 'StripTags']]]);
        $inputFilter->add(['name' => 'changes', 'required' => false, 'filters' => [['name' => 'StripTags']]]);
        $this->setInputFilter($inputFilter);
    }
}
