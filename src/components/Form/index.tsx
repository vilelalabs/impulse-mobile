import { useState } from 'react'
import { ArrowLeft } from 'phosphor-react-native';
import React from 'react';
import {
    View,
    TextInput,
    Image,
    Text,
    TouchableOpacity,
} from 'react-native';


import * as FileSystem from 'expo-file-system';
import { captureScreen } from 'react-native-view-shot';

import { ScreenshotButton } from '../ScreenshotButton';
import { Button } from '../Button';

import { FeedbackType } from '../../components/Widget'
import { theme } from '../../theme';
import { styles } from './styles';
import { feedbackTypes } from '../../utils/feedbackTypes';
import { api } from '../../libs/api';

interface Props {
    feedbackType: FeedbackType;
    onFeedbackCanceled: () => void;
    onFeedbackSent: () => void;
}

export function Form({ feedbackType, onFeedbackCanceled, onFeedbackSent }: Props) {

    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [comment, setComment] = useState('');

    const feedbackTypeInfo = feedbackTypes[feedbackType];

    function handleScreenshot() {
        captureScreen({
            format: 'jpg',
            quality: 0.8,
        })
            .then(uri => setScreenshot(uri))
            .catch(err => console.error(err));
    }

    function handleScreenshotRemove() {
        setScreenshot(null);
    }

    async function handleSendFeedback() {
        if (isSendingFeedback)
            return;
        setIsSendingFeedback(true);

        const screenShotBase = screenshot &&
            await FileSystem.readAsStringAsync(screenshot, { encoding: 'base64' })

        try {
            await api.post('/feedbacks', {
                type: feedbackType,
                screenshot: `data:image/png;base64, ${screenShotBase}`,
                comment,
            })
            onFeedbackSent();
        }
        catch (err) {
            console.error(err);
            setIsSendingFeedback(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onFeedbackCanceled}
                >
                    <ArrowLeft
                        size={24}
                        weight={'bold'}
                        color={theme.colors.text_secondary}
                    />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Image
                        source={feedbackTypeInfo.image}
                        style={styles.image}
                    ></Image>
                    <Text style={styles.titleText}>
                        {feedbackTypeInfo.title}
                    </Text>
                </View>
            </View>
            <TextInput
                multiline
                style={styles.input}
                placeholder={'Descreva o que está acontecendo...'}
                placeholderTextColor={theme.colors.text_secondary}
                autoCorrect={false}
                onChangeText={setComment}
            >
            </TextInput>
            <View style={styles.footer}>
                <ScreenshotButton
                    onTakeShot={handleScreenshot}
                    onRemoveShot={handleScreenshotRemove}
                    screenshot={screenshot}
                />

                <Button
                    isLoading={isSendingFeedback}
                    onPress={handleSendFeedback}
                />
            </View>

        </View>
    );
}